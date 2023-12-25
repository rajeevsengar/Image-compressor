import { LightningElement, api, track } from "lwc";
import saveFile from "@salesforce/apex/FileUploadController.saveFile";
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class FileUploadComponent extends LightningElement {
  imageURL = '';
  previewImage = false
  previewImageFile
  previewImageHeight = ''
  previewImageWidth = ''
  previewImageFileSize=''
  previewIsLoading = false

  showuploadandcompress=true;  
  @api recordId;
  @api buttonClick = false;
  @track lstAllFiles;
  @track compressedfileId=[];
  @track uploadedfileId=[];
  @api isCompressed=false;
  @api isfileuploaded=false;
  @track lstAllData = {};
  @track isLoading = false;
  saveDisabled = false;
  count = 0
  toggleValue = true;
  areSupportedFilesAvailable = false
  haserror = false
  progressbarValue = '0';
  progressbarValueStyle = 'width:' + this.progressbarValue +'%';
  get acceptedFormats() {
    return ['.pdf', '.png', '.csv'];
}

  CHUNK_SIZE = 750000; //Chunk Max size 750Kb  

    handleImagePreview(event){
        this.progressbarValue = '20'
        this.previewImage = true;
        this.previewImageFile = event.detail;
        this.buttonClick = true;
        this.previewIsLoading = true
        console.log(this.previewImageFile);
    }

    hideModalBox(){
        this.previewImage = false;
        this.imageURL = ''
        this.previewImageFile
        this.previewImageHeight = ''
        this.previewImageWidth = ''
        this.previewImageFileSize=''
        this.lstAllData = {};
        this.buttonClick = false;
        this.progressbarValue = '0'
        this.previewIsLoading = false
    }

    handleToggelChange(event){
        if(this.toggleValue){
            this.toggleValue = false;
        }else{
            this.toggleValue = true;
        }
    }

    handleClick(event) {
        this.buttonClick = true;
        this.saveDisabled = true;
        this.haserror = false;
        this.progressbarValue = '0'
        this.count = 0
        this.handleIsLoading(true);
        console.log("buttonClick", this.buttonClick);
    }

    passToParent(event) {
        if(!this.previewImage){
            this.lstAllFiles = event.detail;
            console.log("inparent", JSON.stringify(this.lstAllFiles));
            this.buttonClick = false;
            this.checkvalidation(event);
        }
    }

    handleSettingsChange(event) {
        this.lstAllData = event.detail;
        console.log("data ", JSON.parse(JSON.stringify(this.lstAllData)));
        if(this.previewImage){
            this.processQualitySelection(this.previewImageFile, 1);
        }
    }

    handleSupportedFilesUpload(event){
        console.log('handleSupportedFilesUpload ' +  event.detail);
        this.areSupportedFilesAvailable = event.detail;
        this.saveDisabled = false;
    }

    checkvalidation(event) {
        console.log('check validation')
        this.updateProgress(false)//

        var files = this.lstAllFiles;
        if (files.length < 1) {
            this.showToast("Upload any file", false);
        }

        var resizeCheckbox = this.lstAllData.isResizeChecked;
        if (resizeCheckbox) {
            var imageResizeType = this.lstAllData.imageResizeType;
            if (imageResizeType == "") {
                this.showToast("Choose the Image Resize Type", false);
            } else if (imageResizeType == "Standard") {
                var imageSize = this.lstAllData.imageSize;
                if (imageSize == "") {
                    this.showToast("Choose the Image Size", false);
                }
            } else if (imageResizeType == "Auto") {
                var imageAutoOption = this.lstAllData.imageAutoOption;
                if (imageAutoOption == "") this.showToast("Choose the Image Manual Size", false);
                else if (imageAutoOption == "Pixels") {
                    var pixelsWidth = this.lstAllData.pixelsWidth;
                    var pixelsHeight = this.lstAllData.pixelsHeight;
                    if (pixelsWidth == "" || pixelsWidth == undefined) {
                        this.showToast("Enter the Pixels Width", false);
                    }
                    if (pixelsHeight == "" || pixelsHeight == undefined) {
                        this.showToast("Enter the Pixels Height", false);
                    }
                } else if (imageAutoOption == "Percentage") {
                    var percentageHeight = this.lstAllData.percentageHeight;
                    var percentageWidth = this.lstAllData.percentageWidth;
                    if (percentageWidth == "" || percentageWidth == undefined) {
                        this.showToast("Enter the Percentage Width", false);
                    }
                    if (percentageHeight == "" || percentageHeight == undefined) {
                        this.showToast("Enter the Percentage Height", false);
                    }
                }
            }
        }

        var watermarkCheckbox = this.lstAllData.isWatermarkChecked;
        if (watermarkCheckbox) {
            var typeWatermark = this.lstAllData.typeWatermark;
            if (typeWatermark == "") {
                this.showToast("Choose the type Of watermark", false);
            }
            if (typeWatermark == "Text" || typeWatermark == "TextAndImage") {
                var displayWatermark = this.lstAllData.watermarkTextPosition;
                if (displayWatermark == "") {
                    this.showToast("Choose the position of watermark", false);
                }

                var watermarkText = this.lstAllData.watermarkText;
                if (watermarkText == "") {
                    this.showToast("Enter the watermark text", false);
                }
            }
            if (typeWatermark == "Image" || typeWatermark == "TextAndImage") {
                var uploadWatermarkImage = this.lstAllData.uploadWatermarkImage;
                if (uploadWatermarkImage == null || uploadWatermarkImage == "") {
                    this.showToast("Upload the watermark image", false);
                }

                var watermarkImage = this.lstAllData.watermarkImagePosition;
                if (watermarkImage == "") {
                    this.showToast("Choose the position of watermark image", false);
                }
            }
        }

        if(!this.haserror){
            this.buttonClick = false
            this.updateProgress(false)//
            this.handleFilesChange();
        }
    }

    handleFilesChange() {
        console.log("handleFilesChange");
        var files = this.lstAllFiles;
        var length = files.length

        this.compressedfileId=[];
        for (var i = 0; i < files.length; i++){
            this.processQualitySelection(files[i], length)
        }
        console.log('AFTER MAIN LOOP');
    }

    processQualitySelection(file, length){
        console.log('processQualitySelection')
        var sizeInBytes = file.size;
        var sizeInMB = (sizeInBytes / (1024*1024)).toFixed(2);
        var quality = 0.2

        if(sizeInMB < 1)
        {
            quality = 0.8;
        }
        else if(sizeInMB >= 1 && sizeInMB < 2)
        {
            quality = 0.7;
        }
        else if(sizeInMB >= 2 && sizeInMB < 4)
        {
            quality = 0.6;
        }
        else if(sizeInMB >= 4 && sizeInMB < 6)
        {
            quality = 0.5;
        }
        else if(sizeInMB >= 6 && sizeInMB < 8)
        {
            quality = 0.4;
        }
        else if(sizeInMB >= 8 && sizeInMB < 10)
        {
            quality = 0.3;
        }
        else if(sizeInMB >= 10)
        {
            quality = 0.2;
        }
        file.quality = quality;
        this.compressAndUpload(file, length);
    }

    consoleHW(condName, h, w){
        console.log(condName  + ' h:' + h + ' w:' + w);
    }

    compressAndUpload(file, length) {
        var self = this;
        var watermarkCheckbox = this.lstAllData.isWatermarkChecked;
        var resizeImageCheckbox = this.lstAllData.isResizeChecked;
        var canvas;

        self.updateProgress(false, 5/length)//
        var reader = new FileReader();
        reader.readAsDataURL(file);

        self.updateProgress(false, 5/length)//
        reader.onload = function (e) {
            var img = new Image();
            img.src = e.target.result;
            self.updateProgress(false, 5/length)//
            img.onload = function () {
                self.updateProgress(false, 5/length)//
                canvas = document.createElement("canvas");
                var myContext = canvas.getContext("2d");
                var w = img.width
                var h = img.height
                canvas.width = img.width;
                canvas.height = img.height;
                
                self.consoleHW('else', h, w)
                
                // Resize Settings
                if(resizeImageCheckbox != ""){
                    var ImageSize = Number(self.lstAllData.imageSize);
                    var resizeImageType = self.lstAllData.imageResizeType;
                    var resizeImageAutoType = self.lstAllData.imageAutoOption;
                    var autoPixelsHeight = self.lstAllData.pixelsHeight != '' ? self.lstAllData.pixelsHeight : h;
                    var autoPixelsWidth = self.lstAllData.pixelsWidth != '' ? self.lstAllData.pixelsWidth : w;
                    var autoPercentageHeight = self.lstAllData.percentageHeight  != '' ? self.lstAllData.percentageHeight : 100;
                    var autoPercentageWidth = self.lstAllData.percentageWidth  != '' ? self.lstAllData.percentageWidth : 100;

                    if (
                    resizeImageType == "Standard" &&
                    ImageSize != 0
                    ) {
                        w = (img.width * ImageSize) / 100;
                        h = (img.height * ImageSize) / 100;
                        canvas.width = (img.width * ImageSize) / 100;
                        canvas.height = (img.height * ImageSize) / 100;
    
                        self.consoleHW('standard', h, w)
                    } else if (
                    resizeImageType == "Auto" &&
                    resizeImageAutoType == "Pixels"
                    ) {
                        h = autoPixelsHeight;
                        w = autoPixelsWidth;
                        canvas.width = autoPixelsWidth;
                        canvas.height = autoPixelsHeight;
    
                        self.consoleHW('auto pixels', h, w)
                    } else if (
                    resizeImageType == "Auto" &&
                    resizeImageAutoType == "Percentage"
                    ) {
                        h = (img.height * autoPercentageHeight) / 100;
                        w = (img.width * autoPercentageWidth) / 100;
                        canvas.width = (img.width * autoPercentageWidth) / 100;
                        canvas.height = (img.height * autoPercentageHeight) / 100;
    
                        self.consoleHW('auto percent', h, w)
                    }
                }
                
                self.previewImageHeight = h
                self.previewImageWidth = w

                myContext.globalAlpha = 1.0;
                myContext.drawImage(img, 0, 0, w, h);

                // Watermark Settings
                if(watermarkCheckbox){
                    var WatermarkOption = self.lstAllData.watermarkTextPosition;
                    var text = self.lstAllData.watermarkText;

                    var dateText = self.lstAllData.dateWatermarkCheckbox;
                    if (dateText) {
                        var d = new Date();
                        text =
                            text +
                            "_" +
                            d.getDate() +
                            "/" +
                            (d.getMonth() + 1) +
                            "/" +
                            d.getFullYear() +
                            "_" +
                            d.getHours() +
                            ":" +
                            d.getMinutes() +
                            ":" +
                            d.getSeconds();
                    }
            
                    //Setting the size of the font according to the image size
                    var textSizeHeight = 0.05 * h;
                    var textBold = self.lstAllData.boldText;
                    var textItalic = self.lstAllData.italicText;
                    var styleFont = self.lstAllData.fontStyle;
    
                    if (textBold && textItalic) {
                        myContext.font = "bold italic " + textSizeHeight + "px " + styleFont;
                    } else if (textBold) {
                        myContext.font = "bold " + textSizeHeight + "px " + styleFont;
                    } else if (textItalic) {
                        myContext.font = "italic " + textSizeHeight + "px " + styleFont;
                    } else if (styleFont != "") {
                        myContext.font = textSizeHeight + "px " + styleFont;
                    }
    
                    var colorFont = self.lstAllData.fontColor;
                    myContext.fillStyle = colorFont;
                    var textSizeWidth = 0.35 * w;
    
                    if (myContext.measureText(text).width < textSizeWidth) {
                        textSizeWidth = myContext.measureText(text).width;
                    }
    
                    if (WatermarkOption == "Top-Right") {
                    myContext.fillStyle = "white";
                    myContext.fillRect(
                        canvas.width - textSizeWidth - 0.02 * canvas.width,
                        0.02 * canvas.height,
                        textSizeWidth,
                        textSizeHeight + 0.02 * canvas.height
                    );
                    myContext.fillStyle = colorFont;
                    myContext.fillText(
                        text,
                        canvas.width - textSizeWidth - 0.02 * canvas.width,
                        textSizeHeight + 0.02 * canvas.height,
                        textSizeWidth
                    );
                    } else if (WatermarkOption == "Top-Left") {
                    myContext.fillStyle = "white";
                    myContext.fillRect(
                        0.02 * canvas.width,
                        0.02 * canvas.height,
                        textSizeWidth,
                        textSizeHeight + 0.02 * canvas.height
                    );
                    myContext.fillStyle = colorFont;
                    myContext.fillText(
                        text,
                        0.02 * canvas.width,
                        textSizeHeight + 0.02 * canvas.height,
                        textSizeWidth
                    );
                    } else if (WatermarkOption == "Bottom-Right") {
                    myContext.fillStyle = "white";
                    myContext.fillRect(
                        canvas.width - textSizeWidth - 0.02 * canvas.width,
                        canvas.height - textSizeHeight - 0.05 * canvas.height,
                        textSizeWidth,
                        textSizeHeight + 0.02 * canvas.height
                    );
                    myContext.fillStyle = colorFont;
                    myContext.fillText(
                        text,
                        canvas.width - textSizeWidth - 0.02 * canvas.width,
                        canvas.height - textSizeHeight,
                        textSizeWidth
                    );
                    } else if (WatermarkOption == "Bottom-Left") {
                    myContext.fillStyle = "white";
                    myContext.fillRect(
                        0.02 * canvas.width,
                        canvas.height - textSizeHeight - 0.05 * canvas.height,
                        textSizeWidth,
                        textSizeHeight + 0.02 * canvas.height
                    );
                    myContext.fillStyle = colorFont;
                    myContext.fillText(
                        text,
                        0.02 * canvas.width,
                        canvas.height - textSizeHeight,
                        textSizeWidth
                    );
                    }
    
                    var WImage = self.lstAllData.uploadWatermarkImage;
                    var watermarkType = self.lstAllData.typeWatermark;
                    var watermarkImagePoisition = self.lstAllData.watermarkImagePosition;
                    self.updateProgress(false, 5/length) //60
                    
                    if (
                    (watermarkType == "Image" || watermarkType == "TextAndImage") &&
                    (WImage != null && WImage != '')
                    ) {
                        var reader1 = new FileReader();
                        reader1.readAsDataURL(WImage);
                        self.updateProgress(false, 5/length)
                        reader1.onload = function (e) {
                            self.updateProgress(false, 5/length)
                            var img1 = new Image();
                            img1.src = e.target.result;
                            img1.onload = function () {
                                self.updateProgress(false, 5/length)
                                myContext.globalAlpha = 0.5;
                                var watermarkImageWidth = 0.2 * canvas.width;
                                var watermarkImageHeight = 0.2 * canvas.height;
                                var widthSpace = 0.02 * canvas.width;
                                var heightSpace = 0.02 * canvas.height;
                                if (watermarkImagePoisition == "Top-Right") {
                                    myContext.drawImage(
                                    img1,
                                    canvas.width - watermarkImageWidth - widthSpace,
                                    heightSpace,
                                    watermarkImageWidth,
                                    watermarkImageHeight
                                    );
                                } else if (watermarkImagePoisition == "Top-Left") {
                                    myContext.drawImage(
                                    img1,
                                    widthSpace,
                                    heightSpace,
                                    watermarkImageWidth,
                                    watermarkImageHeight
                                    );
                                } else if (watermarkImagePoisition == "Bottom-Right") {
                                    myContext.drawImage(
                                    img1,
                                    canvas.width - watermarkImageWidth - widthSpace,
                                    canvas.height - watermarkImageHeight - heightSpace,
                                    watermarkImageWidth,
                                    watermarkImageHeight
                                    );
                                } else if (watermarkImagePoisition == "Bottom-Left") {
                                    myContext.drawImage(
                                    img1,
                                    widthSpace,
                                    canvas.height - watermarkImageHeight - heightSpace,
                                    watermarkImageWidth,
                                    watermarkImageHeight
                                    );
                                } else if (watermarkImagePoisition == "Center") {
                                    myContext.drawImage(
                                    img1,
                                    (canvas.width - watermarkImageWidth) / 2,
                                    (canvas.height - watermarkImageHeight) / 2,
                                    watermarkImageWidth,
                                    watermarkImageHeight
                                    );
                                }
    
                                self.previewOrSaveFile(canvas, file, length)
                            };
                        };
                    }else{
                        console.log('before Compress')
                        self.previewOrSaveFile(canvas, file, length)
                    }
                }else{
                    self.previewOrSaveFile(canvas, file, length)
                }

            };
        };
    }

    previewOrSaveFile(canvas, file, length){
        console.log('file.type ' + file.type)
        var self = this
        var dataURL
        var name = file.name
        
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    if(self.previewImage){
                        self.imageURL = URL.createObjectURL(blob);
                        self.afterPreviewDetails(blob)
                    }else{
                        console.log('name ' + name + ' :quality ' + file.quality)
                        self.updateProgress(false, 10/length)//
                        var reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = function () {
                            self.updateProgress(false, 5/length)//
                            dataURL = reader.result;
                            var base64 = "base64,";
                            var dataStart = dataURL.indexOf(base64) + base64.length;
                            dataURL = dataURL.substring(dataStart);
                            self.uploadProcess(dataURL, name, length);
                        }
                    }
                }
            },
            file.type,
            file.quality
        );
    }

    uploadProcess(result, name, length) {
        console.log('uploadProcess result ' + result)
        console.log('uploadProcess name ' + name)
        var startPosition = 0;
        var endPosition = Math.min(result.length, startPosition + this.CHUNK_SIZE);
        this.uploadInChunk(result, startPosition, endPosition, "", name, length, false);
    }

    uploadInChunk(fileContents, startPosition, endPosition, attachId, name, length, skipUpdate) {
        console.log('startPosition ' + startPosition)
        this.updateProgress(false, 10/length, skipUpdate)//
        var self = this;
        var recordId = this.recordId;
        var getchunk = fileContents.substring(startPosition, endPosition);

        saveFile({
        img: encodeURIComponent(getchunk),
        fileName: name,
        recordId: recordId,
        fileId: attachId
        })
        .then((result) => {
            startPosition = endPosition;
            endPosition = Math.min(
            fileContents.length,
            startPosition + self.CHUNK_SIZE
            );


            if (startPosition < endPosition) {
                self.uploadInChunk(
                    fileContents,
                    startPosition,
                    endPosition,
                    result,
                    name,
                    length,
                    true
                );
            } else {
                self.processAfterSavingFile(self, result, length);
            }
        })
        .catch((error) => {
            console.error(error);
            self.showToast("From server: " + error, false);
        }).finally(()=>{
            console.log('FINALLY');
        });
    }

    processAfterSavingFile(self, result, length){
        self.compressedfileId.push(result);   
        self.count += 1
        console.log('length' + length + ' self.count ' + self.count);

        if(self.count == length){
            self.showToast("File is uploaded successfully", true);
            self.hideModalBox()
            self.updateProgress(true)//
            self.isCompressed=true;
            setTimeout(function() {
                self.handleIsLoading(false);
                self.saveDisabled = false;
                self.isCompressed=false;
            }, 2000)
        }
    }

    afterPreviewDetails(file){
        var sizeInBytes = file.size;
        if (sizeInBytes >= 1024 && sizeInBytes < (1024*1024)){
            this.previewImageFileSize = (sizeInBytes / 1024).toFixed(1)  + 'KB';
        }
        else if(sizeInBytes >= (1024*1024) && sizeInBytes < (1024*1024*1024)){
            this.previewImageFileSize = (sizeInBytes / (1024 * 1024)).toFixed(1) + 'MB';
        }
        else{
            this.previewImageFileSize = sizeInBytes + 'B';
        }

        this.previewImageFile = file
        this.previewIsLoading = false
    }

    updateRecordView() {
        setTimeout(() => {
            eval("$A.get('e.force:refreshView').fire();");
        }, 1000); 
    }

    updateProgress(isComplete, value=10, skipUpdate=false) {
        console.log('updateProgress value ' + value)
        if(skipUpdate){
            return
        }
        value = Math.floor(value)
        if(isComplete){
            this.progressbarValue = '100'
            this.progressbarValueStyle = 'width:' + this.progressbarValue +'%';
            return
        }

        this.progressbarValue = (parseInt(this.progressbarValue) + value).toString();
        this.progressbarValueStyle = 'width:' + this.progressbarValue +'%';
            
    }

    handleIsLoading(isLoading) {
        this.isLoading = isLoading;
    }

    showToast(message, isSuccess) {
        const event = new ShowToastEvent({
            title: isSuccess?"Success!":"Error!",
            message: message,
            variant: isSuccess?"Success":"Error",
        // mode: mode
        });
        this.dispatchEvent(event);
        if(!isSuccess){
            this.haserror = true;
            this.saveDisabled = false;
            this.progressbarValue = '0'
            this.handleIsLoading(false);
            return
        }
    }
}