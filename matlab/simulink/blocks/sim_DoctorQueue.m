function out_vec = sim_DoctorQueue(in_vec)
    %#codegen
    % in_vec is 33x1 (32 from router + 1 available slots)
    spec_in = in_vec(1:32);
    doc_avail = in_vec(33);

    persistent dQueue dReason count inFlightCount config;
    if isempty(dQueue)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        dQueue = zeros(1000, 1);
        dReason = zeros(1000, 1);
        count = 0;
        inFlightCount = 0;
    end

    % Enqueue new arrivals (come in pairs: id, reason)
    for i = 1:2:32
        p = spec_in(i);
        r = spec_in(i+1);
        if p > 0 && count < config.queues.doctorCapacity
            count = count + 1;
            dQueue(count) = p;
            dReason(count) = r;
        end
    end

    effectiveSlots = max(0, doc_avail - inFlightCount);
    numToDispatch = min(effectiveSlots, count);

    dispatched = zeros(32, 1);
    dispIdx = 1;
    for i = 1:numToDispatch
        dispatched(dispIdx)   = dQueue(1);
        dispatched(dispIdx+1) = dReason(1);
        dispIdx = dispIdx + 2;
        for j = 1:999
            dQueue(j)  = dQueue(j+1);
            dReason(j) = dReason(j+1);
        end
        dQueue(1000)  = 0;
        dReason(1000) = 0;
        count = count - 1;
    end

    inFlightCount = numToDispatch;
    out_vec = [dispatched; count]; % 32+1 = 33x1
end
