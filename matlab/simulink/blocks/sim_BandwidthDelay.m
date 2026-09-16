function p_out = sim_BandwidthDelay(p_in)
    %#codegen
    % sim_BandwidthDelay — Models image upload delay over a bandwidth-constrained link.
    %
    % ABSTRACT OPERATIONAL SIMULATION. Not clinical inference.
    % Time unit: 1 tick = config.district.sampleTimeSeconds (default 10 s).
    %
    % Upload delay (ticks) = ceil(imageSizeMB * 8 / bandwidthMbps / sampleTimeSeconds)
    %
    % Replaces sim_NetworkDelay in the district model with a bandwidth-aware version.
    % I/O signature is identical: scalar patient_id in → scalar patient_id out (after delay).

    persistent netQueue config;
    if isempty(config)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        netQueue = zeros(1000, 2); % [patient_id, ticks_remaining]
    end

    % Bandwidth delay in ticks (minimum 1 tick)
    uploadSec    = (config.network.imageSizeMB * 8.0) / config.network.bandwidthMbps;
    delayTicks   = max(1, ceil(uploadSec / config.district.sampleTimeSeconds));

    % Decrement remaining time for in-flight uploads; find first completed
    readyIdx = 0;
    for i = 1:1000
        if netQueue(i, 1) > 0
            netQueue(i, 2) = netQueue(i, 2) - 1;
            if netQueue(i, 2) <= 0 && readyIdx == 0
                readyIdx = i;
            end
        end
    end

    p_out = 0;
    if readyIdx > 0
        p_out             = netQueue(readyIdx, 1);
        netQueue(readyIdx, 1) = 0;
        netQueue(readyIdx, 2) = 0;
    end

    % Enqueue new upload
    if p_in > 0
        for i = 1:1000
            if netQueue(i, 1) == 0
                netQueue(i, 1) = p_in;
                netQueue(i, 2) = delayTicks;
                break;
            end
        end
    end
end
