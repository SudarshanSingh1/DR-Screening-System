function out_vec = sim_DoctorResource(dispatched)
    %#codegen
    % dispatched is 32x1 (pairs of id, reason)
    persistent busy patientId reason timeRemaining config;
    if isempty(config)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        busy = false(16, 1);
        patientId = zeros(16, 1);
        reason = zeros(16, 1);
        timeRemaining = zeros(16, 1);
    end

    activeCount = 0;
    completed = zeros(32, 1);
    compIdx = 1;

    % Process existing jobs
    for i = 1:config.resources.doctorCapacity
        if busy(i)
            timeRemaining(i) = timeRemaining(i) - 1;
            if timeRemaining(i) <= 0
                completed(compIdx)   = patientId(i);
                completed(compIdx+1) = reason(i);
                compIdx = compIdx + 2;
                busy(i) = false;
                patientId(i) = 0;
                reason(i) = 0;
            else
                activeCount = activeCount + 1;
            end
        end
    end

    % Assign new jobs
    for d = 1:2:32
        p = dispatched(d);
        r = dispatched(d+1);
        if p > 0
            for i = 1:config.resources.doctorCapacity
                if ~busy(i)
                    busy(i) = true;
                    patientId(i) = p;
                    reason(i) = r;
                    timeRemaining(i) = config.resources.doctorServiceTime;
                    activeCount = activeCount + 1;
                    break;
                end
            end
        end
    end

    availableSlots = config.resources.doctorCapacity - activeCount;
    out_vec = [completed; availableSlots; activeCount]; % 32+1+1 = 34x1
end
