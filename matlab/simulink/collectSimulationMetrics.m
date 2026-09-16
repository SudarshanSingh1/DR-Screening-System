function report = collectSimulationMetrics(out)
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
    end

    report = struct();
    
    % Queues
    pq = getLog('log_PQueueLen');
    if isempty(pq), pq = 0; end
    report.patientQueueHistory = pq;
    report.maxPatientQueue = max(pq);
    
    dq = getLog('log_DQueueLen');
    if isempty(dq), dq = 0; end
    report.doctorQueueHistory = dq;
    report.maxDoctorQueue = max(dq);
    
    % Generated
    gen_id = getLog('log_PatientGenerated');
    gen_count = getLog('log_GeneratedCount');
    if isempty(gen_id), gen_id = 0; end
    report.generatedCountHistory = gen_count;
    
    % Exits
    nonref_log = getLog('log_Exit_NonRef');
    recap_log = getLog('log_Exit_Recap');
    spec_log = getLog('log_Exit_Spec');
    
    if isempty(nonref_log), nonref_log = zeros(1, 16); end
    if isempty(recap_log), recap_log = zeros(1, 16); end
    if isempty(spec_log), spec_log = zeros(1, 32); end
    
    nonref_ids = unique(nonref_log(nonref_log > 0));
    recap_ids = unique(recap_log(recap_log > 0));
    
    % Spec logic (pairs of [id, reason])
    spec_ids = [];
    reasons = [];
    for t = 1:size(spec_log, 1)
        row = spec_log(t, :);
        for i = 1:2:length(row)
            if row(i) > 0
                spec_ids(end+1) = row(i);
                reasons(end+1) = row(i+1);
            end
        end
    end
    % deduplicate
    [unique_spec_ids, uidx] = unique(spec_ids);
    unique_reasons = reasons(uidx);
    
    report.totalPatients = length(unique(gen_id(gen_id > 0)));
    report.ungradeable = length(recap_ids);
    report.nonReferable = length(nonref_ids);
    report.specialistCompleted = length(unique_spec_ids);
    report.processedPatients = report.ungradeable + report.nonReferable + report.specialistCompleted;
    
    report.referable = sum(unique_reasons == 1);
    report.lowConfidence = sum(unique_reasons == 2);
    
    % Throughput timestamps
    firstArr = find(any(gen_id > 0, 2), 1, 'first');
    
    lastComp = 0;
    last1 = find(any(nonref_log > 0, 2), 1, 'last'); if ~isempty(last1), lastComp = max(lastComp, last1); end
    last2 = find(any(recap_log > 0, 2), 1, 'last'); if ~isempty(last2), lastComp = max(lastComp, last2); end
    last3 = find(any(spec_log > 0, 2), 1, 'last'); if ~isempty(last3), lastComp = max(lastComp, last3); end
    
    if isempty(firstArr), firstArr = 0; end
    
    activeDuration = max(0, lastComp - firstArr);
    report.firstArrival = firstArr;
    report.lastCompletion = lastComp;
    report.activeProcessingDuration = activeDuration;
    
    if activeDuration > 0
        report.activeThroughput = report.processedPatients / activeDuration;
    else
        report.activeThroughput = 0;
    end
    
    totalTicks = size(pq, 1);
    report.totalThroughput = report.processedPatients / totalTicks;
    
    % Resource usage
    ai_act = getLog('log_AIActive');
    doc_act = getLog('log_DoctorActive');
    if isempty(ai_act), ai_act = 0; end
    if isempty(doc_act), doc_act = 0; end
    report.aiUtilizationHistory = ai_act;
    report.docUtilizationHistory = doc_act;
end
