public with sharing class AgentforceFileInputController {
    public class FileUploadRequest {
        @AuraEnabled public String fileName;
        @AuraEnabled public String base64Data;
        @AuraEnabled public String mimeType;
    }

    @AuraEnabled
    public static List<Id> uploadFiles(List<FileUploadRequest> files, Id recordId) {
        
        if (files == null || files.isEmpty()) {
            throw new AuraHandledException('Select at least one file to upload.');
        }

        List<ContentVersion> versionsToInsert = new List<ContentVersion>();

        for (FileUploadRequest file : files) {
            System.debug('*** Processing file: ' + file.fileName);
            System.debug('*** Base64 data length: ' + (file.base64Data != null ? file.base64Data.length() : 0));

            if (file == null || String.isBlank(file.fileName) || String.isBlank(file.base64Data)) {
                throw new AuraHandledException('Each uploaded file must include a name and body.');
            }

            ContentVersion version = new ContentVersion();
            version.Title = file.fileName;
            version.PathOnClient = '/' + file.fileName;
            version.VersionData = EncodingUtil.base64Decode(file.base64Data);

            if (recordId != null) {
                version.FirstPublishLocationId = recordId;
            }

            versionsToInsert.add(version);
        }

        insert versionsToInsert;

        List<Id> contentVersionIds = new List<Id>();
        for (ContentVersion version : versionsToInsert) {
            contentVersionIds.add(version.Id);
        }

        return contentVersionIds;
    }
}
