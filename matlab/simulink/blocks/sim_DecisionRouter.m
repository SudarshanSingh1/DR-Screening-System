function out_vec = sim_DecisionRouter(in_vec)
    %#codegen
    nonRef = zeros(16, 1); nr = 1;
    spec = zeros(32, 1); sp = 1;
    recap = zeros(16, 1); rc = 1;

    for i = 1:16
        p = in_vec(2*i-1);
        fs = in_vec(2*i);
        if p > 0
            if fs == 0
                nonRef(nr) = p; nr = nr + 1;
            elseif fs == 1 || fs == 2
                spec(sp) = p;
                spec(sp+1) = fs; 
                sp = sp + 2;
            elseif fs == -1
                recap(rc) = p; rc = rc + 1;
            end
        end
    end
    out_vec = [nonRef; spec; recap]; % 16 + 32 + 16 = 64x1
end
