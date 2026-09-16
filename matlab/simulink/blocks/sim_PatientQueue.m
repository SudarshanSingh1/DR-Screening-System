function out_vec = sim_PatientQueue(in_vec)
    %#codegen
    p_in = in_vec(1); ai_available_slots = in_vec(2);
    persistent pQueue count inFlightCount config;
    if isempty(pQueue)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        pQueue = zeros(1000, 1);
        count = 0;
        inFlightCount = 0;
    end

    if p_in > 0 && count < config.queues.patientCapacity
        count = count + 1;
        pQueue(count) = p_in;
    end

    % Multi-server handshake: subtract in-flight from available slots
    effectiveSlots = max(0, ai_available_slots - inFlightCount);
    numToDispatch = min(effectiveSlots, count);
    dispatched = zeros(16, 1);

    for i = 1:numToDispatch
        dispatched(i) = pQueue(1);
        for j = 1:999
            pQueue(j) = pQueue(j+1);
        end
        pQueue(1000) = 0;
        count = count - 1;
    end

    inFlightCount = numToDispatch;
    out_vec = [dispatched; count]; % 16+1 = 17x1
end
