function out_vec = sim_ImageAcquisition(t)
    %#codegen
    % sim_ImageAcquisition — Models bilateral fundus image acquisition at district camps.
    %
    % ABSTRACT OPERATIONAL SIMULATION. Not clinical inference.
    % Time unit: 1 tick = config.district.sampleTimeSeconds (default 10 s).
    %
    % Two constraints govern patient release rate:
    %   (1) Population flow: patients present at populationArrivalRatePerHour.
    %   (2) Camera bottleneck: totalCameras cameras, each takes captureTimeMinutes per patient.
    % Effective inter-arrival = max(populationInterval, cameraInterval) in ticks.
    %
    % Output: [patient_id, cumulative_count] — identical format to sim_PatientArrival.

    persistent numArrived ticks config;
    if isempty(config)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        numArrived = 0;
        ticks      = 0;
    end

    totalCameras = config.acquisition.campCount * config.acquisition.camerasPerCamp;

    % Population flow interval (ticks)
    secPerHour        = 3600;
    popIntervalSec    = secPerHour / config.acquisition.populationArrivalRatePerHour;
    popIntervalTicks  = popIntervalSec / config.district.sampleTimeSeconds;

    % Camera bottleneck interval (ticks)
    captureSec       = config.acquisition.captureTimeMinutes * 60;
    camIntervalTicks = captureSec / (totalCameras * config.district.sampleTimeSeconds);

    effectiveInterval = max(popIntervalTicks, camIntervalTicks);

    ticks  = ticks + 1;
    p_out  = 0;

    if numArrived < config.simulation.numberOfPatients
        if ticks >= effectiveInterval
            numArrived = numArrived + 1;
            p_out      = numArrived;
            ticks      = 0;
        end
    end

    out_vec = [p_out, numArrived]; % [patient_id, cumulative_count]
end
