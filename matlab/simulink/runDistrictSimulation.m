function results = runDistrictSimulation()
    % runDistrictSimulation — Runs the district telemedicine screening simulation.
    %
    % Reads config from base workspace (set via assignin before calling).
    % Builds DRDistrictSystem.slx if not present.
    % Returns simulation metrics with annual projection.

    currentFile = mfilename('fullpath');
    [currentDir, ~, ~] = fileparts(currentFile);
    addpath(fullfile(currentDir, 'blocks'));

    if ~evalin('base', 'exist(''config'', ''var'')')
        config = simulationConfig();
        assignin('base', 'config', config);
    else
        config = evalin('base', 'config');
    end

    modelName = 'DRDistrictSystem';
    slxPath   = fullfile(currentDir, [modelName, '.slx']);
    if ~isfile(slxPath)
        buildDistrictModel();
    end

    load_system(modelName);
    set_param(modelName, 'StopTime', num2str(config.simulation.stopTime));
    out = sim(modelName);

    report = collectSimulationMetrics(out);

    % --- Annual Projection ---
    % Patients processed in simulated operational day → scale to annual
    operatingDaysPerYear = config.district.operatingDaysPerYear;
    annualCapacity       = report.processedPatients * operatingDaysPerYear;
    targetMet            = annualCapacity >= config.district.annualPatientTarget;

    % Effective throughput in patients/hour (real time)
    tickSec          = config.district.sampleTimeSeconds;
    durationRealSec  = report.activeProcessingDuration * tickSec;
    if durationRealSec > 0
        patientsPerHour = report.processedPatients / (durationRealSec / 3600);
    else
        patientsPerHour = 0;
    end

    report.annualCapacityProjection = annualCapacity;
    report.annualTargetMet          = targetMet;
    report.patientsPerHour          = patientsPerHour;
    report.simulatedDayPatients     = report.processedPatients;

    results = report;
    close_system(modelName, 0);
end
