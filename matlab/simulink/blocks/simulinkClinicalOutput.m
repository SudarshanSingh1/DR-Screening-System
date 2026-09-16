function out_vec = simulinkClinicalOutput(in_vec)
    %#codegen
    out_vec = zeros(32, 1);
    for i = 1:16
        p = in_vec(2*i-1);
        conf = in_vec(2*i);
        if p > 0
            out_vec(2*i-1) = p;
            out_vec(2*i) = conf;
        end
    end
end
