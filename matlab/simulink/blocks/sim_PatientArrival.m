function out_vec = sim_PatientArrival(t)
    %#codegen
    persistent numArrived ticks config;
    if isempty(config)
        coder.extrinsic('evalin');
        config = evalin('base', 'config');
        numArrived = 0;
        ticks = 0;
    end

    ticks = ticks + 1;
    p_out = 0;
    if numArrived < config.simulation.numberOfPatients
        if ticks >= config.simulation.interArrivalTime
            numArrived = numArrived + 1;
            p_out = numArrived;
            ticks = 0;
        end
    end
    out_vec = [p_out, numArrived]; % [generated_id, generated_count]
end
