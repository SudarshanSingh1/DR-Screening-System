function out_vec = simulinkReferableDecision(in_vec)
    %#codegen
    out_vec = zeros(32, 1);
    for i = 1:16
        p = in_vec(2*i-1);
        idx = in_vec(2*i);
        if p > 0
            ref = 0;
            if idx >= 0
                % ABSTRACT SIMULATION MODE
                % Referable DR mapped to Class 2, 3, 4 (Moderate, Severe, PDR)
                if idx >= 2
                    ref = 1;
                else
                    ref = 0;
                end
            else
                ref = -1;
            end
            out_vec(2*i-1) = p;
            out_vec(2*i) = ref;
        end
    end
end
