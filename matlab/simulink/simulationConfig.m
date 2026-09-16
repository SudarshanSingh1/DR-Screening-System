function config = simulationConfig()
    config = struct();
    
    % --- SIMULATION PARAMETERS ---
    config.simulation = struct();
    config.simulation.numberOfPatients = 10;
    config.simulation.interArrivalTime = 5;
    config.simulation.sampleTime = 1;
    config.simulation.stopTime = 200;
    
    % --- DEPLOYMENT PARAMETERS ---
    config.deployment = struct();
    config.deployment.MAX_AI_CAPACITY = 16;
    config.deployment.MAX_DOCTOR_CAPACITY = 16;
    config.deployment.MAX_QUEUE_CAPACITY = 1000;
    
    % --- RESOURCES ---
    config.resources = struct();
    config.resources.aiServiceTime = 3;
    config.resources.aiCapacity = 1;
    config.resources.doctorServiceTime = 10;
    config.resources.doctorCapacity = 1;
    
    % --- QUEUES ---
    config.queues = struct();
    config.queues.patientCapacity = config.deployment.MAX_QUEUE_CAPACITY;
    config.queues.doctorCapacity = config.deployment.MAX_QUEUE_CAPACITY;
    
    % --- AI / NETWORK ---
    config.networkDelay = 2;
    config.ai = struct();
    config.ai.referableThreshold = 0.207980;
    config.ai.uncertaintyThreshold = 0.50;
    
    % Validate simulation stop time
    minimumRequired = (config.simulation.numberOfPatients * config.simulation.interArrivalTime) + ...
                      config.networkDelay + ...
                      (config.simulation.numberOfPatients * config.resources.aiServiceTime) + ...
                      (config.simulation.numberOfPatients * config.resources.doctorServiceTime);
    if config.simulation.stopTime < minimumRequired
        disp(['WARNING: config.simulation.stopTime (', num2str(config.simulation.stopTime), ') may be too short.']);
    end

    % =========================================================
    % DISTRICT-LEVEL PARAMETERS
    % Used by the district telemedicine simulation only.
    % Time unit for district model: 1 tick = 10 seconds.
    % =========================================================

    % --- DISTRICT PROGRAMME TARGETS ---
    config.district = struct();
    config.district.annualPatientTarget   = 100000; % patients/year programme target
    config.district.operatingDaysPerYear  = 250;    % working days (excl. weekends/holidays)
    config.district.dailyPatientTarget    = 400;    % 100000 / 250
    config.district.hoursPerDay           = 8;      % clinic operating hours per day
    config.district.sampleTimeSeconds     = 10;     % 1 Simulink tick = 10 real seconds

    % --- IMAGE ACQUISITION (at screening camps) ---
    % Camera count constrains patient throughput if captureTime / totalCameras
    % exceeds the population arrival rate.
    config.acquisition = struct();
    config.acquisition.campCount                  = 5;   % screening locations in district
    config.acquisition.camerasPerCamp             = 1;   % fundus cameras per camp
    config.acquisition.captureTimeMinutes         = 3;   % bilateral capture time per patient (minutes)
    config.acquisition.populationArrivalRatePerHour = 50; % patients presenting per hour across all camps

    % --- NETWORK / BANDWIDTH ---
    % Upload delay: ceil(imageSizeMB * 8 / bandwidthMbps / sampleTimeSeconds) ticks
    config.network = struct();
    config.network.imageSizeMB   = 2.0;  % compressed bilateral fundus image pair (MB)
    config.network.bandwidthMbps = 20.0; % available upload bandwidth (Mbps); 4G/broadband default
    % Bandwidth presets for reference:
    %   2G  (EDGE):  0.128 Mbps  → delay ≈ 12 ticks (120 s)
    %   3G  (HSPA):  1.0   Mbps  →         2 ticks (20 s)
    %   4G  (LTE):   20.0  Mbps  →         1 tick  (10 s, negligible)
    %   WiFi/LAN:    100.0 Mbps  →         1 tick  (instantaneous)
end

