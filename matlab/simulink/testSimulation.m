function testSimulation()
    disp('========================================');
    disp('STARTING AUTOMATED BOTTLENECK TEST SUITE');
    disp('========================================');
    
    currentFile = mfilename('fullpath');
    [currentDir, ~, ~] = fileparts(currentFile);
    cd(currentDir);
    addpath(fullfile(currentDir, 'blocks'));
    
    disp('Building generic model from scratch...');
    clear functions; clear persistent;
    buildDRScreeningModel();
    disp('Model built successfully.');
    
    scenarios = {
        'Baseline', 10, 5, 3, 1, 10, 1;
        'AI Bottleneck', 50, 1, 5, 1, 1, 1;
        'AI Scale-Up', 50, 1, 5, 3, 1, 1;
        'Doctor Bottleneck', 50, 1, 1, 2, 10, 1;
        'Doctor Scale-Up', 50, 1, 1, 2, 10, 3;
        'Zero Edge Case', 0, 1, 3, 1, 10, 1;
        'High Capacity', 50, 1, 5, 16, 5, 16
    };

    resultsTable = cell(size(scenarios, 1), 6);
    
    for i = 1:size(scenarios, 1)
        name = scenarios{i, 1};
        numPat = scenarios{i, 2};
        arr = scenarios{i, 3};
        ai_time = scenarios{i, 4};
        ai_cap = scenarios{i, 5};
        doc_time = scenarios{i, 6};
        doc_cap = scenarios{i, 7};
        
        fprintf('\n--- SCENARIO: %s ---\n', name);
        
        % Write transient config
        config = simulationConfig();
        config.simulation.numberOfPatients = numPat;
        config.simulation.interArrivalTime = arr;
        config.resources.aiServiceTime = ai_time;
        config.resources.aiCapacity = ai_cap;
        config.resources.doctorServiceTime = doc_time;
        config.resources.doctorCapacity = doc_cap;
        
        % Calculate minimum required stop time + buffer
        minT = (numPat * arr) + 2 + (numPat * ai_time) + (numPat * doc_time);
        config.simulation.stopTime = ceil(minT * 1.5) + 50;
        
        assignin('base', 'config', config);
        
        % Run
        clear functions; clear persistent;
        res = runSimulation();
        
        fprintf('Generated: %d | Completed: %d\n', config.simulation.numberOfPatients, res.processedPatients);
        fprintf('Active Duration: %d | Throughput: %.4f\n', res.activeProcessingDuration, res.activeThroughput);
        
        % Validation
        if res.processedPatients ~= config.simulation.numberOfPatients
            fprintf('WARNING: Patient conservation failed! (Expected %d, got %d)\n', config.simulation.numberOfPatients, res.processedPatients);
        end
        
        resultsTable{i, 1} = name;
        resultsTable{i, 2} = res.processedPatients;
        resultsTable{i, 3} = res.maxPatientQueue;
        resultsTable{i, 4} = res.maxDoctorQueue;
        resultsTable{i, 5} = res.activeProcessingDuration;
        resultsTable{i, 6} = res.activeThroughput;
    end
    
    disp('========================================');
    disp('TEST SUITE COMPLETED');
    disp('Summary:');
    fprintf('%-20s | %-10s | %-10s | %-10s | %-10s | %-10s\n', 'Scenario', 'Processed', 'Max PQ', 'Max DQ', 'Duration', 'Throughput');
    for i = 1:size(resultsTable, 1)
        fprintf('%-20s | %-10d | %-10d | %-10d | %-10d | %-10.4f\n', ...
            resultsTable{i,1}, resultsTable{i,2}, resultsTable{i,3}, resultsTable{i,4}, resultsTable{i,5}, resultsTable{i,6});
    end
    disp('========================================');
end
