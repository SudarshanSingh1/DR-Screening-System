function results = runSimulation(imagePaths)
    currentFile = mfilename('fullpath');
    [currentDir, ~, ~] = fileparts(currentFile);
    [parentDir, ~, ~] = fileparts(currentDir);
    [root, ~, ~] = fileparts(parentDir);
    
    corePath = fullfile(root, 'matlab', 'core');
    if isfolder(corePath), addpath(corePath); end
    
    if ~evalin('base', 'exist(''config'', ''var'')')
        config = simulationConfig();
        assignin('base', 'config', config);
    else
        config = evalin('base', 'config');
    end
    
    if nargin < 1 || isempty(imagePaths)
        imagePaths = {};
        aptosImg = fullfile(root, 'data', 'test_images', 'Level0', '000c1434d8d7.png');
        if isfile(aptosImg), imagePaths{end+1} = aptosImg; end
    elseif ischar(imagePaths) || isstring(imagePaths)
        imagePaths = {char(imagePaths)};
    end
    
    assignin('base', 'imagePaths', imagePaths);
    
    modelName = 'DRScreeningSystem';
    slxPath = fullfile(currentDir, [modelName, '.slx']);
    if ~isfile(slxPath)
        buildDRScreeningModel();
    end
    
    load_system(modelName);
    set_param(modelName, 'StopTime', num2str(config.simulation.stopTime));
    out = sim(modelName);
    
    report = collectSimulationMetrics(out);
    try
        visualizeSimulationResults(out, report);
    catch
    end
    results = report;
    close_system(modelName, 0);
end
