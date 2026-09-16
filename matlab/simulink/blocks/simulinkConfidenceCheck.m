function out_vec = simulinkConfidenceCheck(in_vec)
    %#codegen
    out_vec = zeros(32, 1);
    for i = 1:16
        p = in_vec(2*i-1);
        ref = in_vec(2*i);
        if p > 0
            conf = 0;
            if ref >= 0
                % ABSTRACT SIMULATION MODE
                % 10% chance of Low Confidence (requires Specialist)
                if mod(p * 19, 100) < 10
                    isLow = 1;
                else
                    isLow = 0;
                end
                
                if isLow > 0
                    conf = 2;
                else
                    conf = ref;
                end
            else
                conf = -1;
            end
            out_vec(2*i-1) = p;
            out_vec(2*i) = conf;
        end
    end
end
