function testRealPipeline()
% testRealPipeline - Verification of the real DR inference pipeline execution.
%
% Tests pipeline execution using real test images.
% Note: This test verifies pipeline structure and execution integrity only.
% It does NOT validate clinical accuracy of the model.

    fprintf('\n======================================================\n');
    fprintf(' DR Screening System -- Real Pipeline Execution Test\n');
    fprintf('======================================================\n\n');

    % 1. Dynamically locate the repository root
    currentDir = fileparts(mfilename('fullpath'));
    baseDir = fileparts(currentDir); % /matlab
    rootDir = fileparts(baseDir); % /

    addpath(fullfile(baseDir, 'algorithms', 'preprocessing'));
    addpath(fullfile(baseDir, 'inference'));
    addpath(fullfile(baseDir, 'explainability'));
    addpath(fullfile(baseDir, 'reporting'));

    % 2 & 3. Discover actual images
    testImagesDir = fullfile(rootDir, 'data', 'test_images');
    if ~isfolder(testImagesDir)
        error('Test images directory not found: %s', testImagesDir);
    end

    levels = {'Level0', 'Level1', 'Level2', 'Level3', 'Level4'};
    testImages = {};
    for i = 1:numel(levels)
        levelDir = fullfile(testImagesDir, levels{i});
        if isfolder(levelDir)
            imgs = dir(fullfile(levelDir, '*.png'));
            if ~isempty(imgs)
                % 4. Select valid test images dynamically (take the first one from each level)
                testImages{end+1} = fullfile(levelDir, imgs(1).name);
            end
        end
    end

    if isempty(testImages)
        error('No test images found in %s', testImagesDir);
    end

    pass = 0; fail = 0;

    % TEST A: Model loading path integrity
    fprintf('[TEST A] Model path repository-relative, loading...\n');
    try
        [net, classNames, config] = loadDRModel();
        fprintf('  PASS: Model loaded.\n');
        pass = pass + 1;
    catch ME
        fprintf('  FAIL: %s\n', ME.message);
        error('Cannot continue without valid model.');
    end

    % 5. Run the real inference pipeline
    for k = 1:numel(testImages)
        imgPath = testImages{k};
        [~, imgName, ext] = fileparts(imgPath);
        fprintf('\n[TEST %d] Executing pipeline on %s%s (Execution check only)\n', k, imgName, ext);
        try
            dlImg = preprocessFundus(imgPath);

            % 6. Verify output structure and expected output validity
            % Prediction
            [probs, predClass, isReferable, isLowConfidence, maxProb] = predictDR(net, dlImg, config);
            
            % Check probability structure (7. Never fabricate expected probabilities)
            assert(numel(probs) == 5, 'Probability vector must have 5 elements.');
            assert(all(isfinite(probs)), 'Probabilities contain NaN or Inf.');
            assert(abs(sum(probs) - 1.0) < 1e-4, 'Probabilities must sum to 1.');

            % 9. Keep Grad-CAM execution separate but testable
            heatmap = generateGradCAM(net, dlImg, predClass + 1);
            assert(isequal(size(heatmap), [224, 224]), 'Heatmap must be 224x224.');
            assert(all(isfinite(heatmap(:))), 'Heatmap contains NaN or Inf.');

            % Test full reporting function
            res = runScreening(imgPath);
            assert(isfield(res, 'clinicalState'), 'Result missing clinicalState');
            assert(isfield(res, 'heatmap'), 'Result missing heatmap');

            fprintf('  PASS: Pipeline executed successfully. (Prediction: %s)\n', classNames{predClass + 1});
            pass = pass + 1;
        catch ME
            fprintf('  FAIL: %s\n', ME.message);
            fail = fail + 1;
        end
    end

    fprintf('\n======================================================\n');
    fprintf(' Results: %d/%d passed\n', pass, pass+fail);
    if fail == 0
        fprintf(' ALL EXECUTION TESTS PASSED\n');
    else
        fprintf(' %d TEST(S) FAILED\n', fail);
    end
    fprintf('======================================================\n');
end
