function out_vec = simulinkQualityAssessment(in_vec)
    %#codegen
    out_vec = zeros(32, 1);
    for i = 1:16
        p = in_vec(i);
        if p > 0
            % ABSTRACT SIMULATION MODE
            % Deterministic quality fail (e.g. 5% failure rate for testing)
            % 1 = PASS, 0 = FAIL (Recapture)
            if mod(p * 13, 100) < 5
                qc = 0;
            else
                qc = 1;
            end
            out_vec(2*i-1) = p;
            out_vec(2*i) = qc;
        end
    end
end
