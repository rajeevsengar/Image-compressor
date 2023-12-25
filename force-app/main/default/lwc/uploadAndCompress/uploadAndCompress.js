import { LightningElement,track,api } from 'lwc';
import fetchFiles from '@salesforce/apex/FileUploadController.fetchFiles';
import deleteFiles from '@salesforce/apex/FileUploadController.deleteFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class UploadAndCompress extends LightningElement {
    @api recordId;
    @track lstAllFiles=[];
    @track error;
    @track areDetailsVisible=false;
    @track areSupportedFilesAvailable = false;
    @track fileSize;
    @track multiple=true;
    fileToBeUploaded=[];
    @api compressFileIds=[];
    @api uploadedfileid=[];
    @api buttonClickValue;
    @track compressedAfter;
    @track uploadedafter;
    @track fileData
    @track columns = [
        {label: 'File name',fieldName: 'name',type: 'text',sortable: true},
        {label: 'File Type',fieldName: 'type',type: 'text',sortable: true},
        {label: 'Orginal File Size',fieldName: 'size',type: 'text',sortable: true},
        {label: 'Updated File Size',fieldName: 'newsize',type: 'text',sortable: true},
        {type: "button-icon", typeAttributes: {iconName: "utility:preview", name: "preview", iconClass: "slds-icon-text-success"}, fixedWidth: 50}, 
        {type: "button-icon", typeAttributes: {iconName: "utility:delete", name: "delete", iconClass: "slds-icon-text-error"}, fixedWidth: 50} 
    ];
    @api get compressFile(){
        return this.compressedAfter;
    }
    set compressFile(value) {
        console.log('value',value)
        this.setAttribute('compressedAfter', value);
        this.compressedAfter = value;      
        console.log('compressFileIds3',JSON.parse(JSON.stringify(this.compressFileIds)));
        console.log('compressFileIds4',JSON.parse(JSON.stringify(this.fileToBeUploaded)));
        if(value){
            this.getupdatedData(this.compressFileIds);
            this.updateRecordView();
            this.compressedAfter=false;  

        }
    }

    @api get buttonClick(){
        return this.buttonClickValue;
    }
    set buttonClick(value) {
        console.log('button clicked notified in child');
        this.setAttribute('buttonClickValue', value);
        this.buttonClickValue = value;
        this.handleValueChange(value);
    }

    //a method called in setter
    handleValueChange(value) {
        console.log('value',value);
        console.log('fileToBeUploaded',this.fileToBeUploaded);
        if(value){
            console.log('firing event ' + this.fileToBeUploaded);
            const custEvent = new CustomEvent(
                'callpasstoparent', {
                    detail: this.fileToBeUploaded
                });
            this.dispatchEvent(custEvent);
        }

    }

    openfileUpload(event) {
        console.log('openfileUpload');
        this.fileToBeUploaded = []
        var unsupportedFiles = []
        this.lstAllFiles = []
        let filestotal= event.target.files;
        let tempData=[];
       
        console.log('first:fileToBeUploaded',JSON.parse(JSON.stringify(this.fileToBeUploaded)));
        let extensions =['image/png','image/jpg','image/jpeg', 'image/bmp'];

        for(let i= 0; i < filestotal.length; i++){
            
            if(extensions.includes(filestotal[i].type)){
                this.fileToBeUploaded.push(filestotal[i]);
            }else{
                unsupportedFiles.push(filestotal[i]);
                continue;
            }

            let fileJSON={};
            let file = filestotal[i];

            fileJSON.id = i;
            fileJSON.name = file.name;
            fileJSON.type = file.type;
            let Value = file.size;

            if (Value >= 1024 && Value < (1024*1024)){
                var sizeInMB = (Value / 1024).toFixed(1);
                fileJSON.size=sizeInMB + 'KB';
            }
            else if(Value >= (1024*1024) && Value < (1024*1024*1024)){
                var sizeInMB = (Value / (1024 * 1024)).toFixed(1);
                fileJSON.size=sizeInMB + 'MB';
            }
            else{
                fileJSON.size=Value + 'B';
            }

            tempData.push(fileJSON); 
        }

        this.lstAllFiles = tempData;
        this.notifySupportedFiles();
        this.areDetailsVisible = true;

        console.log('lstAllFiles', this.lstAllFiles);
        console.log('unsupportedFiles', unsupportedFiles);
        console.log('second:fileToBeUploaded', JSON.parse(JSON.stringify(this.fileToBeUploaded))); 

        // Show Message for unsupported files
        if(unsupportedFiles.length > 1){
            this.showToast('We have removed the non-image files that you have selected. Please turn off the \'Compress and Upload Image Files\' toggle to upload those files.')
        }else if(unsupportedFiles.length > 0){
            this.showToast('We have removed the non-image file that you have selected. Please turn off the \'Compress and Upload Image Files\' toggle to upload that file.')
        }
    }  

    updateToBeUploadedFiles(){
        let lstAllFilesName = [];
        let tempData = [];

        for(let i = 0; i < this.lstAllFiles.length; i++){
            lstAllFilesName.push(this.lstAllFiles[i].name);
        }

        tempData = this.fileToBeUploaded.filter((row) => lstAllFilesName.includes(row.name))
        this.fileToBeUploaded = tempData
        console.log('updateToBeUploadedFiles' + this.fileToBeUploaded)
    }

    notifySupportedFiles(){
        console.log('notifySupportedFiles ' + this.fileToBeUploaded);
        if(this.fileToBeUploaded.length > 0){
            this.areSupportedFilesAvailable = true;
        }else{
            this.areSupportedFilesAvailable = false;
        }

        const custEvent = new CustomEvent(
            'supportedfilesupload', {
                detail: this.areSupportedFilesAvailable
        });

        this.dispatchEvent(custEvent);
        console.log('notifySupportedFiles 2' + this.fileToBeUploaded);
    }   

    getupdatedData(fileIds){
        fetchFiles({contentVersionIdList : fileIds, lstAllFiles : JSON.stringify(this.lstAllFiles)})
            .then(result => {   
                console.log('result',result);
                this.lstAllFiles = result;
                this.areDetailsVisible=true;
            })
            .catch(error => {
                console.log('this.error',error);
                this.error = error;
            })
        }

    handleRowAction(event) {
        if (event.detail.action.name === "delete") {
            this.deleteSelectedRow(event.detail.row);
            console.log('event.detail.row',JSON.parse(JSON.stringify(event.detail.row)));
        }else if(event.detail.action.name === "preview"){
            var newData = this.fileToBeUploaded.filter((row) => row.name == event.detail.row.name);
            console.log('In Preview ' +  newData[0])

            const custEvent = new CustomEvent(
                'preview', {
                    detail: newData[0]
                });
            this.dispatchEvent(custEvent);
        }
    }


    deleteSelectedRow(deleteRow) {
        console.log('deleteRow ' + deleteRow)
        console.log('this.lstAllFiles ' + this.lstAllFiles)

        let newData = []
        newData = this.lstAllFiles.filter((row) => row.id !== deleteRow.id);
        this.lstAllFiles = newData;
        this.updateToBeUploadedFiles();
        
        console.log('this.fileToBeUploaded ' + this.fileToBeUploaded)

        if(this.fileToBeUploaded.length == 0){
            this.areDetailsVisible = false;
            this.notifySupportedFiles();
        }

        deleteFiles({deleteId : deleteRow.id})
        .then(result => {
            this.updateRecordView();
        })
        .catch(error => {
            console.error(error)
            if(error && error.body && error.body.message != 'Id Not found'){
                this.showToast('Error!', error.body.message, 'dismissible', 'error');
            }
            this.error = error;
        });

    }

    showToast(titile = 'Information', message, mode='sticky', variant='info') {
        const event = new ShowToastEvent({
            title: titile,
            message: message,
            mode: mode,
            variant: variant
        });

        this.dispatchEvent(event);
    }

    updateRecordView() {
        setTimeout(() => {
            eval("$A.get('e.force:refreshView').fire();");
        }, 1000); 
    }
}