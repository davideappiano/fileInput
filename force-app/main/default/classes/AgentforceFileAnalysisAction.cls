global with sharing class AgentforceFileAnalysisAction {
    global class Request {
        @AuraEnabled
        @InvocableVariable(
            label='File Input'
            description='Structured file input for analysis.'
            required=true
        )
        global AgentforceFileInputPayload fileInput;
    }

    global class Response {
        @AuraEnabled
        @InvocableVariable(
            label='Analysis'
            description='Analysis result for the provided files.'
        )
        global String analysis;
    }

    @InvocableMethod(
        label='Analyze Files'
        description='Accepts comma-separated ContentVersion IDs and returns an analysis result.'
    )
    global static List<Response> analyzeFiles(List<Request> requests) {
        List<Response> responses = new List<Response>();

        if (requests == null) {
            return responses;
        }

        for (Request request : requests) {
            String contentVersionIds = request != null && request.fileInput != null
                ? request.fileInput.contentVersionIds
                : null;

            // multiples IDS
            List<String> ids = contentVersionIds != null ? 
                contentVersionIds.split(',') : 
                new List<String>();

            // TODO: RObert SAFA => Implem ici l'analyse des fichiers à partir des ContentVersion IDs

            Response response = new Response();
            response.analysis = 'Files analyzed';
            responses.add(response);
        }

        return responses;
    }
}
