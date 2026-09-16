function p_out = sim_NetworkDelay(p_in)
    %#codegen
    persistent netQueue config;
    if isempty(config)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        netQueue = zeros(1000, 2);
    end

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
        p_out = netQueue(readyIdx, 1);
        netQueue(readyIdx, 1) = 0;
        netQueue(readyIdx, 2) = 0;
    end

    if p_in > 0
        for i = 1:1000
            if netQueue(i, 1) == 0
                netQueue(i, 1) = p_in;
                netQueue(i, 2) = config.networkDelay;
                break;
            end
        end
    end
end
