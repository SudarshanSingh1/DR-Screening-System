function [probs, predClass, isReferable, isLowConfidence, maxProb] = predictDR(net, dlImg, config)
    % predictDR Executes inference and applies thresholding rules.
    
    % Predict
    dlProbs = predict(net, dlImg);
    probs = extractdata(dlProbs); % 1x5 or 5x1
    probs = probs(:)'; % Ensure 1x5
    
    [maxProb, classIdx] = max(probs);
    predClass = classIdx - 1; % 0-indexed class (0 to 4)
    
    refProb = sum(probs(3:5)); % Classes 2, 3, 4
    
    isReferable = refProb >= config.referable_dr.optimized_threshold;
    isLowConfidence = maxProb < config.uncertainty_handling.provisional_confidence_threshold;
end
