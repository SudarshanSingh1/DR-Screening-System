function out_vec = sim_AIResource(dispatched)
    %#codegen
    persistent busy patientId timeRemaining config;
    if isempty(config)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        busy = false(16, 1);
        patientId = zeros(16, 1);
        timeRemaining = zeros(16, 1);
    end

    activeCount = 0;
    completed = zeros(16, 1);
    compIdx = 1;

    % Process existing jobs
    for i = 1:config.resources.aiCapacity
        if busy(i)
            timeRemaining(i) = timeRemaining(i) - 1;
            if timeRemaining(i) <= 0
                completed(compIdx) = patientId(i);
                compIdx = compIdx + 1;
                busy(i) = false;
                patientId(i) = 0;
            else
                activeCount = activeCount + 1;
            end
        end
    end

    % Assign new jobs
    for d = 1:16
        if dispatched(d) > 0
            for i = 1:config.resources.aiCapacity
                if ~busy(i)
                    busy(i) = true;
                    patientId(i) = dispatched(d);
                    timeRemaining(i) = config.resources.aiServiceTime;
                    activeCount = activeCount + 1;
                    break;
                end
            end
        end
    end

    availableSlots = config.resources.aiCapacity - activeCount;
    out_vec = [completed; availableSlots; activeCount]; % 16+1+1 = 18x1
end
