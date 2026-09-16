function heatmap = generateGradCAM(net, dlImg, classIdx)
    % generateGradCAM Computes Grad-CAM heatmap for a given class.
    % classIdx is 1-indexed (1 to 5)
    
    targetLayer = 'efficientnet-b0|model|head|MulLayer';
    
    heatmap = dlfeval(@gradcamFunction, net, dlImg, targetLayer, classIdx);
    
    heatmap = extractdata(heatmap);
    
    % NaN safety check for rescale
    if max(heatmap(:)) == min(heatmap(:))
        heatmap = zeros(size(heatmap), 'like', heatmap);
    else
        heatmap = rescale(heatmap);
    end
    
    heatmap = imresize(heatmap, [224, 224], 'bilinear');
end

function gradcamMap = gradcamFunction(net, dlImg, featureLayerName, classIdx)
    [y, features] = forward(net, dlImg, 'Outputs', {'DR_Softmax', featureLayerName});
    
    % Select the score for the target class
    score = y(classIdx);
    
    % Compute gradient of the score with respect to the feature map
    dScoreDFmap = dlgradient(score, features);
    
    % Global average pooling on gradients to get weights
    weights = mean(dScoreDFmap, [1 2]);
    
    % Compute weighted combination of feature maps
    gradcamMap = sum(features .* weights, 3);
    
    % ReLU
    gradcamMap = max(gradcamMap, 0);
end
