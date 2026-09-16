function result = runScreening(imagePath)
    % runScreening Orchestrates the real inference pipeline and Grad-CAM.
    
    [net, classNames, config] = loadDRModel();
    
    dlImg = preprocessFundus(imagePath);
    
    [probs, predClass, isReferable, isLowConfidence] = predictDR(net, dlImg, config);
    
    % Generate Grad-CAM for the predicted class
    heatmap = generateGradCAM(net, dlImg, predClass + 1);
    
    % Map to clinical state (-1: Ungradeable, 0: Non-Ref, 1: Ref, 2: Low-Conf)
    % Currently skipping -1 (quality assessment not fully implemented in real pipeline here)
    if isLowConfidence
        clinicalState = 2;
    elseif isReferable
        clinicalState = 1;
    else
        clinicalState = 0;
    end
    
    result = struct();
    result.imagePath = imagePath;
    result.prediction = struct('classIndex', predClass, ...
                               'className', classNames{predClass + 1}, ...
                               'probabilities', probs);
    result.referable = isReferable;
    result.lowConfidence = isLowConfidence;
    result.clinicalState = clinicalState;
    result.heatmap = heatmap;
end
