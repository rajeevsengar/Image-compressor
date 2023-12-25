public class FileUploadController {
    public static List<contentVersionWrapper> contentVersionList; 
    public class wrapper{
        public String documentId{get;set;}
        public String name{get;set;}
    }
    //list of supported file that can be upload
    /*@AuraEnabled
    public static List<String> supportedFiles() {
        // String extensions = system.label.Extensions_of_images_to_be_converted_to_pdf;
        String extensions = 'docx,jpg,png,jpeg';
        list<String> oldextensionList = extensions.split(',');
        List<String> newExtensionList = new List<String>();
        for(String ext : oldextensionList) {
            newExtensionList.add('.' + ext);
        }
        //system.debug('supported files'+newExtensionList );
        return newExtensionList;
    }*/

    @AuraEnabled
    public static List<contentVersionWrapper> fetchFiles(List<String> contentVersionIdList, String lstAllFiles){
        system.debug('lstAllFiles'+lstAllFiles);
        List<ContentVersion> listContentVersion= [SELECT id, ContentDocumentId,VersionData, PathOnClient,ContentSize, FileType, FileExtension, Title FROM ContentVersion WHERE Id IN : contentVersionIdList];
        List<contentVersionWrapper> contentVersionList = (List<contentVersionWrapper>)System.JSON.deserialize(lstAllFiles, List<contentVersionWrapper>.class);
        
        system.debug('contentVersionList'+contentVersionList);
        
        for(ContentVersion c : listContentVersion){
            String sizeOfFile=convertSize(c.ContentSize);
            system.debug('sizeOfFile'+sizeOfFile);

            for(contentVersionWrapper cv : contentVersionList){
                if(cv.name == c.PathOnClient){
                    cv.newsize = sizeOfFile;
                    cv.id = c.id;
                }
            }
        }
        system.debug('contentVersionList1'+contentVersionList);
        return contentVersionList;
    }


    @AuraEnabled
    public static void deleteFiles(String deleteId){
        system.debug('contentVersionIdList'+deleteId);
        List<ContentDocument> listContentDoc = [select id,Title,(select id,ContentDocumentId from ContentVersions where id =: deleteId) from ContentDocument];
        if(listContentDoc.size() == 0){
            throw new AuraHandledException('Id Not found');
        }

        List<ContentDocument> listtodelete = new List<ContentDocument>();         
        for(ContentDocument con: listContentDoc){
            if(con.ContentVersions.size()>0){
                listtodelete.add(con);
            }
        }
        delete listtodelete;

    }
    
    @AuraEnabled
    public static uploadedfiledetail saveOtherFiles(String fileName, String base64Data, Id recordId){
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        ContentVersion cv = new ContentVersion();
        //cv.Title = fileName;
        cv.PathOnClient = fileName;
        cv.FirstPublishLocationId = recordId;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        Insert cv;
        return new uploadedfiledetail(cv.PathOnClient,cv.id);

    }
    public class uploadedfiledetail{
        @AuraEnabled public String name;
        @AuraEnabled public String id;
        public uploadedfiledetail(String name,String id){
            this.id=id;
            this.name=name;
        }
    }
    public static String convertSize(Integer value) {
         /* string representation if a file's size, such as 2 KB, 4.1 MB, etc */
         if (Value < 1024)
         return string.valueOf(Value) + 'Bytes';
       else
       if (Value >= 1024 && Value < (1024*1024))
       {
         //KB
         Decimal kb = Decimal.valueOf(Value);
         kb = kb.divide(1024,1);
         return string.valueOf(kb) + 'KB';
       }
       else
       if (Value >= (1024*1024) && Value < (1024*1024*1024))
       {
         //MB
         Decimal mb = Decimal.valueOf(Value);
         mb = mb.divide((1024*1024),1);
         return string.valueOf(mb) + 'MB';
       }
       else
       {
         //GB
         Decimal gb = Decimal.valueOf(Value);
         gb = gb.divide((1024*1024*1024),1);
        
         return string.valueOf(gb) + 'GB';
       }    
    }
    
    @AuraEnabled
    public static String saveFile(String img, String fileName, String recordId, String fileId) 
    {
        system.debug('saveFile fileId:' + fileId);
        system.debug('saveFile fileName' + fileName);
        if (fileId == '') 
        {
            fileId = saveImage(img, fileName, recordId); 
        } 
        else 
        {
            appendImage(fileId, img);
        }
        return fileId;
    }

    @AuraEnabled
    public static String saveImage(String img,  String fileName, String recordId) 
    {
        system.debug('saveImage');
        String contentVersion_DocumentId = '';
        String base64Data = EncodingUtil.urlDecode(img, 'UTF-8');
        Blob bImage = EncodingUtil.base64Decode(base64Data);
        ContentVersion image = new ContentVersion();
        image.PathOnClient = fileName;
        //image.File_Tag__c = fileTag;
        image.VersionData = bImage;
        image.IsMajorVersion = false;
        
        try
        {
         	insert image;   
            ContentVersion cv = [Select ContentDocumentId from ContentVersion where id = :image.Id];
            System.debug('recordId: ' + recordId);
            if(cv != null)
            {
            	contentVersion_DocumentId = String.valueOf(image.id);
                ContentDocumentLink cdl = new ContentDocumentLink();
                cdl.LinkedEntityId = recordId;
                cdl.ContentDocumentId = cv.ContentDocumentId;
                cdl.shareType = 'V';
                if (Schema.sObjectType.ContentDocumentLink.isCreateable()) 
                {
                	insert cdl;
                }
                system.debug('contentVersion_DocumentId:' + contentVersion_DocumentId);
            }            
            system.debug('Image inserted');
        }
        catch(DMLException e) 
        {
            system.debug('Exception has occurred! ' + e.getMessage());
        }      
        return contentVersion_DocumentId;
    }
    
    public static void appendImage(String fileId, String img) 
    {
        system.debug('appendImage fileId');
        
        List<String> fId = fileId.split(':');
        Id cvId;
        if(fId.size() > 0)
        {
            cvId = Id.valueOf(fId[0]);
        }
        String base64Data = EncodingUtil.urlDecode(img, 'UTF-8');
        ContentVersion cv = [SELECT Id, VersionData FROM ContentVersion WHERE Id = : cvId];
     
        String existingBody = EncodingUtil.base64Encode(cv.VersionData);

        System.debug('cv.Id' + cv.Id);
        System.debug('appendImage fileId: ' + cv.VersionData);
        
        cv.VersionData = EncodingUtil.base64Decode(existingBody + base64Data);  

        System.debug('appendImage fileId:2 ' + cv.VersionData);

        update cv;
        
    }

    public class contentVersionWrapper {
        //@AuraEnabled public ContentVersion contentversionobj;
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String type;
        @AuraEnabled public String size;
        @AuraEnabled public String newsize;
        @AuraEnabled public Integer ContentSize;

        public contentVersionWrapper(String id,String name,String type, String newsize,Integer ContentSize){
            this.id=id;
            this.name=name;
            this.type=type;
            this.newsize=newsize;
            this.ContentSize=ContentSize;
        }
    }
    
}