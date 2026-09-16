function out_vec = simulinkQualityDecision(in_vec)
    %#codegen
    out_vec = zeros(32, 1);
    for i = 1:16
        p = in_vec(2*i-1);
        qc = in_vec(2*i);
        if p > 0
            proceed = qc;
            out_vec(2*i-1) = p;
            out_vec(2*i) = proceed;
        end
    end
end
