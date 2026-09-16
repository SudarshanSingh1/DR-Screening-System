function processedImage = preprocessFundus(imagePath)
    % preprocessFundus Loads and preprocesses a fundus image for DR_EfficientNetB0_V2.mat
    % The native V2 model expects 224x224x3 float32 data in the [0, 255] range.
    
    if ~isfile(imagePath)
        error('preprocessFundus:FileNotFound', 'The image file does not exist: %s', imagePath);
    end
    
    img = imread(imagePath);
    
    % Ensure 3-channel RGB
    if size(img, 3) == 1
        img = cat(3, img, img, img);
    elseif size(img, 3) > 3
        img = img(:, :, 1:3);
    end
    
    % Resize to 224x224 using bilinear interpolation
    img = imresize(img, [224, 224], 'bilinear');
    
    % Convert to single (float32) [0, 255]
    if isa(img, 'uint8')
        img = single(img);
    else
        % If it was double in [0, 1], scale to 255
        if max(img(:)) <= 1.0
            img = single(img) * 255.0;
        else
            img = single(img);
        end
    end
    
    % Convert to dlarray with SSC format
    processedImage = dlarray(img, 'SSC');
end
