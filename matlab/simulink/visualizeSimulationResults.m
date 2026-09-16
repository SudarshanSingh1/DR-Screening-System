function visualizeSimulationResults(out, report)
    f = figure('Name', 'DR Screening System Results', 'NumberTitle', 'off', 'Position', [100, 100, 1000, 800]);
    
    % Queue lengths
    subplot(3, 2, 1);
    plot(report.patientQueueHistory, 'LineWidth', 2);
    hold on;
    plot(report.doctorQueueHistory, 'LineWidth', 2);
    title('Queue Lengths vs Time');
    xlabel('Simulation Ticks');
    ylabel('Number of Patients');
    legend('AI Screening Queue', 'Doctor Review Queue');
    grid on;
    
    % Clinical Case Distribution
    subplot(3, 2, 2);
    labels = {'Ungradeable', 'Non-Referable', 'Referable', 'Low Confidence'};
    counts = [report.ungradeable, report.nonReferable, report.referable, report.lowConfidence];
    if sum(counts) > 0
        pie(counts);
        legend(labels, 'Location', 'bestoutside');
    else
        text(0.5, 0.5, 'No cases processed', 'HorizontalAlignment', 'center');
    end
    title('Final Clinical Case Distribution');
    
    % Generated vs Completed Patients
    subplot(3, 2, 3);
    plot(report.generatedCountHistory, 'LineWidth', 2);
    hold on;
    
    % Calculate cumulative completed
    nonref_log = getLog('log_Exit_NonRef');
    recap_log = getLog('log_Exit_Recap');
    spec_log = getLog('log_Exit_Spec');
    
    total_ticks = size(report.generatedCountHistory, 1);
    cumulative_completed = zeros(total_ticks, 1);
    count = 0;
    for t = 1:total_ticks
        count = count + sum(nonref_log(t, :) > 0) + sum(recap_log(t, :) > 0) + sum(spec_log(t, 1:2:end) > 0);
        cumulative_completed(t) = count;
    end
    
    plot(cumulative_completed, 'LineWidth', 2);
    title('System Flow');
    xlabel('Simulation Ticks');
    ylabel('Cumulative Patients');
    legend('Generated', 'Completed');
    grid on;
    
    % Throughput Metrics Text
    subplot(3, 2, 4);
    axis off;
    str = sprintf(['--- Throughput Metrics ---\n', ...
                   'Total Processed: %d\n', ...
                   'First Arrival: %d\n', ...
                   'Last Completion: %d\n', ...
                   'Active Duration: %d\n\n', ...
                   'Active Window Throughput: %.4f patients/tick\n', ...
                   'Full Sim Throughput: %.4f patients/tick\n'], ...
                   report.processedPatients, report.firstArrival, report.lastCompletion, ...
                   report.activeProcessingDuration, report.activeThroughput, report.totalThroughput);
    text(0, 0.5, str, 'FontSize', 11, 'Interpreter', 'none');
    
    % Resource Utilization
    subplot(3, 2, 5);
    plot(report.aiUtilizationHistory, 'LineWidth', 2);
    hold on;
    plot(report.docUtilizationHistory, 'LineWidth', 2);
    title('Active Resource Slots');
    xlabel('Simulation Ticks');
    ylabel('Active Jobs');
    legend('AI Resources', 'Doctor Resources');
    grid on;

    % Fetch Helper
    function val = getLog(name)
        val = [];
        try
            if isprop(out, name), val = out.(name); end
        catch, end
        if isempty(val)
            try
                if isfield(out, name), val = out.(name); end
            catch, end
        end
        if isempty(val)
            try
                if ismethod(out, 'get'), val = out.get(name); end
            catch, end
        end
        if isempty(val)
            try, val = evalin('base', name); catch, end
        end
        if isempty(val)
            try
                logs = out.get('logsout');
                el = logs.get(name);
                if ~isempty(el), val = el.Values.Data; end
            catch, end
        end
        if ~isempty(val)
            if isstruct(val) && isfield(val, 'signals')
                val = val.signals.values;
            elseif isa(val, 'timeseries')
                val = val.Data;
            end
            val = squeeze(val);
        end
        if isempty(val)
            val = zeros(size(report.generatedCountHistory, 1), 16); 
            if contains(name, 'Spec'), val = zeros(size(report.generatedCountHistory, 1), 32); end
        end
    end
end
