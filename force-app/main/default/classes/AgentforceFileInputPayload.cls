global class AgentforceFileInputPayload {
    @AuraEnabled
    @InvocableVariable(
        label='ContentVersion IDs'
        description='Comma-separated ContentVersion IDs to analyze.'
        required=true
    )
    global String contentVersionIds;
}
