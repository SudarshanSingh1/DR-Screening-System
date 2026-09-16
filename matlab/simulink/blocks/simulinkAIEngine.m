function out_vec = simulinkAIEngine(in_vec)
    %#codegen
    out_vec = zeros(32, 1);
    for i = 1:16
        p = in_vec(2*i-1);
        proceed = in_vec(2*i);
        if p > 0
            idx = 0;
            if proceed > 0
                % ABSTRACT SIMULATION MODE
                % Deterministic class index (0 to 4)
                idx = mod(p * 17, 5);
            else
                idx = -1;
            end
            out_vec(2*i-1) = p;
            out_vec(2*i) = idx;
        end
    end
end
