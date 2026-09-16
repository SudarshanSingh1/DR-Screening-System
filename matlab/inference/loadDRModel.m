function [net, classNames, config] = loadDRModel()
    % loadDRModel Loads the canonical DR EfficientNetB0 V2 network and configuration.
    
    persistent cachedNet cachedClasses cachedConfig;
    
    if isempty(cachedNet)
        baseDir = fileparts(fileparts(fileparts(mfilename('fullpath'))));
        modelPath = fullfile(baseDir, 'model', 'weights', 'active', 'DR_EfficientNetB0_V2.mat');
        configPath = fullfile(baseDir, 'model', 'config', 'model_config.json');
        
        if ~isfile(modelPath)
            error('loadDRModel:ModelNotFound', 'Model file not found: %s', modelPath);
        end
        if ~isfile(configPath)
            error('loadDRModel:ConfigNotFound', 'Config file not found: %s', configPath);
        end
        
        data = load(modelPath);
        cachedNet = data.net;
        cachedClasses = data.classNames;
        
        fid = fopen(configPath, 'r');
        raw = fread(fid, '*char')';
        fclose(fid);
        cachedConfig = jsondecode(raw);
    end
    
    net = cachedNet;
    classNames = cachedClasses;
    config = cachedConfig;
end
