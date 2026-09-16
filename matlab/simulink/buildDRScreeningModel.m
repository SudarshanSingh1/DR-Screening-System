function buildDRScreeningModel()
    modelName = 'DRScreeningSystem';
    currentFile = mfilename('fullpath');
    [currentDir, ~, ~] = fileparts(currentFile);
    slxDir = currentDir;
    
    if bdIsLoaded(modelName)
        close_system(modelName, 0);
    end
    
    slxFile = fullfile(slxDir, [modelName, '.slx']);
    if isfile(slxFile)
        delete(slxFile);
    end

    new_system(modelName);

    % Configure fixed-step discrete
    config = simulationConfig();
    set_param(modelName, 'SolverType', 'Fixed-step');
    set_param(modelName, 'FixedStep', num2str(config.simulation.sampleTime));
    set_param(modelName, 'StopTime', num2str(config.simulation.stopTime));
    set_param(modelName, 'SimulationMode', 'normal');

    % Helpers
    function add_imf(name, fcn, dims, pos, color)
        add_block('simulink/User-Defined Functions/Interpreted MATLAB Function', [modelName, '/', name]);
        set_param([modelName, '/', name], 'MATLABFcn', fcn, 'OutputDimensions', dims, 'SampleTime', '-1', 'Position', pos, 'BackgroundColor', color);
    end

    function add_mux(name, inputs, pos)
        add_block('simulink/Signal Routing/Mux', [modelName, '/', name]);
        set_param([modelName, '/', name], 'Inputs', num2str(inputs), 'Position', pos);
    end

    function add_demux(name, outputs, pos)
        add_block('simulink/Signal Routing/Demux', [modelName, '/', name]);
        if isscalar(outputs)
            outStr = num2str(outputs);
        else
            outStr = ['[', num2str(outputs), ']'];
        end
        set_param([modelName, '/', name], 'Outputs', outStr, 'Position', pos);
    end


    function add_delay(name, pos)
        add_block('simulink/Discrete/Unit Delay', [modelName, '/', name]);
        set_param([modelName, '/', name], 'SampleTime', '1', 'Position', pos);
    end
    
    function add_log(name, varName, pos)
        add_block('simulink/Sinks/To Workspace', [modelName, '/', name]);
        set_param([modelName, '/', name], 'VariableName', varName, 'SaveFormat', 'Array', 'Position', pos);
    end

    x = 50; y = 50; w = 180; h = 40; gapX = 40; gapY = 60;

    % 1. Patient Generation & Arrival
    add_block('simulink/Sources/Clock', [modelName, '/Clock']);
    set_param([modelName, '/Clock'], 'Position', [x, y, x+40, y+h]);
    
    add_imf('Patient Arrival', 'sim_PatientArrival', '2', [x+100, y, x+100+w, y+h], '[0.85, 0.93, 1.0]');
    
    % Split arrival into ID and Count
    add_demux('Demux_Arr', 2, [x+100+w+20, y, x+100+w+30, y+h]);
    add_log('Log_GenID', 'log_PatientGenerated', [x+100+w+60, y-50, x+100+w+100, y-30]);
    add_log('Log_GenCount', 'log_GeneratedCount', [x+100+w+60, y-100, x+100+w+100, y-80]);

    % 2. Network Delay
    add_imf('Network API Delay', 'sim_NetworkDelay', '1', [x+100+w+60, y, x+100+w+60+w, y+h], '[0.9, 0.9, 0.9]');
    add_log('Log_NetOut', 'log_NetworkOutput', [x+100+w+60+w+40, y-50, x+100+w+60+w+80, y-30]);

    % 3. Patient Queue
    add_mux('Mux_PQ', 2, [x+100+w+60+w+20, y, x+100+w+60+w+30, y+h]);
    add_imf('Patient Screening Queue', 'sim_PatientQueue', '17', [x+100+w+60+w+50, y, x+100+w+60+w+50+w, y+h], '[0.85, 0.93, 1.0]');
    
    % Split Queue output: dispatched(16) and q_length(1)
    add_demux('Demux_PQ', [16, 1], [x+100+w+60+w+50+w+20, y, x+100+w+60+w+50+w+30, y+h]);
    add_log('Log_PQueueLen', 'log_PQueueLen', [x+100+w+60+w+50+w+60, y-50, x+100+w+60+w+50+w+100, y-30]);

    % 4. AI Resource
    add_imf('AI Screening Resource', 'sim_AIResource', '18', [x+100+w+60+w+50+w+60, y, x+100+w+60+w+50+w+60+w, y+h], '[0.85, 0.93, 1.0]');
    
    % Split AI output: completed(16), availableSlots(1), activeSlots(1)
    add_demux('Demux_AI', [16, 1, 1], [x+100+w+60+w+50+w+60+w+20, y, x+100+w+60+w+50+w+60+w+30, y+h]);
    
    add_delay('Delay_AIAvail', [x+100+w+60+w+50+w+60, y+h+20, x+100+w+60+w+50+w+60+w-50, y+h+50]);
    add_log('Log_AIActive', 'log_AIActive', [x+100+w+60+w+50+w+60+w+60, y-50, x+100+w+60+w+50+w+60+w+100, y-30]);

    % 5. Pipeline
    y2 = y + gapY*2;
    add_imf('Image Quality Assessment', 'simulinkQualityAssessment', '32', [x, y2, x+w, y2+h], '[0.80, 0.95, 0.80]');
    add_imf('Quality Decision', 'simulinkQualityDecision', '32', [x+w+gapX, y2, x+2*w+gapX, y2+h], '[1.0, 0.95, 0.75]');
    add_imf('AI Screening Engine', 'simulinkAIEngine', '32', [x+2*(w+gapX), y2, x+3*w+2*gapX, y2+h], '[0.80, 0.85, 1.0]');
    add_imf('Referable DR Decision', 'simulinkReferableDecision', '32', [x+3*(w+gapX), y2, x+4*w+3*gapX, y2+h], '[1.0, 0.85, 0.80]');
    add_imf('Confidence Assessment', 'simulinkConfidenceCheck', '32', [x+4*(w+gapX), y2, x+5*w+4*gapX, y2+h], '[0.95, 0.85, 1.0]');
    add_imf('Clinical Decision Output', 'simulinkClinicalOutput', '32', [x+5*(w+gapX), y2, x+6*w+5*gapX, y2+h], '[0.75, 1.0, 0.75]');

    % 6. Router
    y3 = y2 + gapY*2;
    add_imf('Decision Router', 'sim_DecisionRouter', '64', [x, y3, x+w, y3+h], '[1.0, 0.8, 0.6]');
    
    % Split Router output: nonRef(16), spec(32), recap(16)
    add_demux('Demux_Router', [16, 32, 16], [x+w+20, y3, x+w+30, y3+h]);
    
    add_log('Log_Exit_NonRef', 'log_Exit_NonRef', [x+w+80, y3-50, x+w+120, y3-30]);
    add_log('Log_Exit_Recap', 'log_Exit_Recap', [x+w+80, y3+50, x+w+120, y3+70]);

    % 7. Doctor Queue
    add_mux('Mux_DQ', 2, [x+w+80, y3, x+w+90, y3+h]);
    add_imf('Doctor Review Queue', 'sim_DoctorQueue', '33', [x+w+120, y3, x+2*w+120, y3+h], '[1.0, 0.8, 0.6]');
    
    % Split Doc Queue output: dispatched(32), q_length(1)
    add_demux('Demux_DQ', [32, 1], [x+2*w+140, y3, x+2*w+150, y3+h]);
    add_log('Log_DQueueLen', 'log_DQueueLen', [x+2*w+180, y3-50, x+2*w+220, y3-30]);
    
    % 8. Doctor Resource
    add_imf('Doctor Review Resource', 'sim_DoctorResource', '34', [x+2*w+180, y3, x+3*w+180, y3+h], '[1.0, 0.8, 0.6]');
    
    % Split Doc Resource output: completed(32), availableSlots(1), activeSlots(1)
    add_demux('Demux_Doc', [32, 1, 1], [x+3*w+200, y3, x+3*w+210, y3+h]);
    
    add_delay('Delay_DocAvail', [x+2*w+180, y3+h+20, x+3*w+180, y3+h+50]);
    add_log('Log_DocActive', 'log_DoctorActive', [x+3*w+250, y3-50, x+3*w+290, y3-30]);
    
    add_log('Log_Exit_Spec', 'log_Exit_Spec', [x+3*w+250, y3, x+3*w+290, y3+h]);

    % ========================================
    % CONNECTIONS
    % ========================================
    add_line(modelName, 'Clock/1', 'Patient Arrival/1', 'autorouting', 'smart');
    
    % Arrival -> Demux_Arr
    add_line(modelName, 'Patient Arrival/1', 'Demux_Arr/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_Arr/1', 'Network API Delay/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_Arr/1', 'Log_GenID/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_Arr/2', 'Log_GenCount/1', 'autorouting', 'smart');
    
    % Network -> Mux_PQ (Port 1)
    add_line(modelName, 'Network API Delay/1', 'Mux_PQ/1', 'autorouting', 'smart');
    add_line(modelName, 'Network API Delay/1', 'Log_NetOut/1', 'autorouting', 'smart');
    
    % AIAvail Delay -> Mux_PQ (Port 2)
    add_line(modelName, 'Delay_AIAvail/1', 'Mux_PQ/2', 'autorouting', 'smart');
    
    % Mux_PQ -> Patient Queue
    add_line(modelName, 'Mux_PQ/1', 'Patient Screening Queue/1', 'autorouting', 'smart');
    
    % Patient Queue -> Demux_PQ
    add_line(modelName, 'Patient Screening Queue/1', 'Demux_PQ/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_PQ/1', 'AI Screening Resource/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_PQ/2', 'Log_PQueueLen/1', 'autorouting', 'smart');
    
    % AI Resource -> Demux_AI
    add_line(modelName, 'AI Screening Resource/1', 'Demux_AI/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_AI/1', 'Image Quality Assessment/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_AI/2', 'Delay_AIAvail/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_AI/3', 'Log_AIActive/1', 'autorouting', 'smart');
    
    % Pipeline
    add_line(modelName, 'Image Quality Assessment/1', 'Quality Decision/1', 'autorouting', 'smart');
    add_line(modelName, 'Quality Decision/1', 'AI Screening Engine/1', 'autorouting', 'smart');
    add_line(modelName, 'AI Screening Engine/1', 'Referable DR Decision/1', 'autorouting', 'smart');
    add_line(modelName, 'Referable DR Decision/1', 'Confidence Assessment/1', 'autorouting', 'smart');
    add_line(modelName, 'Confidence Assessment/1', 'Clinical Decision Output/1', 'autorouting', 'smart');
    
    % Router
    add_line(modelName, 'Clinical Decision Output/1', 'Decision Router/1', 'autorouting', 'smart');
    add_line(modelName, 'Decision Router/1', 'Demux_Router/1', 'autorouting', 'smart');
    
    % Router Outputs
    add_line(modelName, 'Demux_Router/1', 'Log_Exit_NonRef/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_Router/3', 'Log_Exit_Recap/1', 'autorouting', 'smart');
    
    % Mux_DQ (Spec IDs + Doc Avail)
    add_line(modelName, 'Demux_Router/2', 'Mux_DQ/1', 'autorouting', 'smart');
    add_line(modelName, 'Delay_DocAvail/1', 'Mux_DQ/2', 'autorouting', 'smart');
    
    % Doctor Queue
    add_line(modelName, 'Mux_DQ/1', 'Doctor Review Queue/1', 'autorouting', 'smart');
    add_line(modelName, 'Doctor Review Queue/1', 'Demux_DQ/1', 'autorouting', 'smart');
    
    add_line(modelName, 'Demux_DQ/1', 'Doctor Review Resource/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_DQ/2', 'Log_DQueueLen/1', 'autorouting', 'smart');
    
    % Doctor Resource
    add_line(modelName, 'Doctor Review Resource/1', 'Demux_Doc/1', 'autorouting', 'smart');
    
    % Outputs
    add_line(modelName, 'Demux_Doc/1', 'Log_Exit_Spec/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_Doc/2', 'Delay_DocAvail/1', 'autorouting', 'smart');
    add_line(modelName, 'Demux_Doc/3', 'Log_DocActive/1', 'autorouting', 'smart');
    
    % Save
    slxFile = fullfile(slxDir, [modelName, '.slx']);
    save_system(modelName, slxFile);
    close_system(modelName, 0);
    fprintf('Simulink model built and saved: %s\n', slxFile);
end
