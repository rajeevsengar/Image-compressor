import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class FileUploadCheckboxes extends LightningElement {
    // Compress Settings
    isCompressChecked = true
    quality = '0.2'

    // Resize Settings
    isResizeChecked = false
    imageResizeType = ''
    isStandardChecked = false
    isAutoChecked = false
    imageSize = ''
    imageAutoOption = ''
    isPixelsSelected = false
    isPercentSelected = false
    pixelsHeight = ''
    pixelsWidth = ''
    percentageHeight = ''
    percentageWidth = ''

    // Watermark Settings
    isWatermarkChecked = false
    typeWatermark = ''
    isTextWatermarkSelected = false
    fontStyleOptions = ''
    fontStyle = ''
    fontColor = ''
    watermarkTextPosition = ''
    watermarkText = ''
    boldText = false
    italicText = false
    dateWatermarkCheckbox = false
    isImageWatermarkSelected = false
    watermarkImagePosition = ''
    uploadWatermarkImage = ''
    uplodedImageName = ''
    watermarkImageUploaded = false;

    checkboxOptions = [
        {'label': '', 'value': true}
    ]

    options = [
        // {'label': 'No-Compression', 'value': '1'},
        {'label': '8 - Min Compression', 'value': '0.8'},
        {'label': '6', 'value': '0.6'},
        {'label': '4', 'value': '0.4'},
        {'label': '2 - Max Compression', 'value': '0.2'}
        ]
    imageResizeTypeOptions = [
        {'label': 'Standard', 'value': 'Standard'},
        {'label': 'Manual', 'value': 'Auto'}
        ]
    
    imageResizeStandardOptions = [
        {'label': '25%', 'value': '25'},
        {'label': '50%', 'value': '50'},
        {'label': '75%', 'value': '75'},
        {'label': '100%', 'value': '100'}
        ]

    imageResizeAutoOptions = [
        {'label': 'Pixels', 'value': 'Pixels'},
        {'label': 'Percentage', 'value': 'Percentage'}
        ]

    typeWatermarkOptions = [
        {'label': 'Text', 'value': 'Text'},
        {'label': 'Image', 'value': 'Image'},
        {'label': 'Text and Image', 'value': 'TextAndImage'},
        ]

    fontStyleOptions = [
        {'label': 'Arial', 'value': 'Arial'},
        {'label': 'Verdana', 'value': 'Verdana'},
        {'label': 'Times New Roman', 'value': 'Times New Roman'},
        {'label': 'Courier New', 'value': 'Courier New'},
        {'label': 'Serif', 'value': 'serif'},
        {'label': 'Sans-Serif', 'value': 'sans-serif'},
        ]
    Watermarkoptions = [
        {'label': 'Top-Right', 'value': 'Top-Right'},
        {'label': 'Top-Left', 'value': 'Top-Left'},
        {'label': 'Bottom-Right', 'value': 'Bottom-Right'},
        {'label': 'Bottom-Left', 'value': 'Bottom-Left'},
        ]

    WatermarkImageoptions = [
        {'label': 'Top-Right', 'value': 'Top-Right'},
        {'label': 'Top-Left', 'value': 'Top-Left'},
        {'label': 'Bottom-Right', 'value': 'Bottom-Right'},
        {'label': 'Bottom-Left', 'value': 'Bottom-Left'},
        {'label': 'Center', 'value': 'Center'}
        ]

    accept = ['png', 'jpg', 'jpeg']

    @api isCompressButtonClicked
    @api get buttonClicked(){
        return this.isCompressButtonClicked;
    }

    set buttonClicked(value){
        this.setAttribute('isCompressButtonClicked', value);
        this.isCompressButtonClicked = value
        if(value == true){
            this.handleButtonClick();
        }
    }
   
    @api isCompressed
    @api get compressDone(){
        return this.isCompressed;
    }

    set compressDone(value){
        this.setAttribute('isCompressed', value);
        this.isCompressed = value
        if(value == true){
            this.clearAllSettings();
        }
    }

    handleButtonClick(){
        let data = {}
        data.isCompressChecked = this.isCompressChecked
        data.quality = this.quality
        data.isResizeChecked = this.isResizeChecked
        data.imageResizeType = this.imageResizeType
        data.imageSize = this.imageSize
        data.imageAutoOption = this.imageAutoOption
        data.isPixelsSelected = this.isPixelsSelected
        data.isPercentSelected = this.isPercentSelected
        data.pixelsHeight = this.pixelsHeight
        data.pixelsWidth = this.pixelsWidth
        data.percentageHeight = this.percentageHeight
        data.percentageWidth = this.percentageWidth
        data.isWatermarkChecked = this. isWatermarkChecked
        data.typeWatermark = this.typeWatermark
        data.isTextWatermarkSelected = this.isTextWatermarkSelected
        data.fontStyle = this.fontStyle
        data.fontColor = this.fontColor
        data.watermarkTextPosition = this.watermarkTextPosition
        data.watermarkText = this.watermarkText
        data.boldText = this.boldText
        data.italicText = this. italicText
        data.dateWatermarkCheckbox = this.dateWatermarkCheckbox
        data.isImageWatermarkSelected = this.isImageWatermarkSelected
        data.watermarkImagePosition = this.watermarkImagePosition
        data.uploadWatermarkImage = this.uploadWatermarkImage

        console.log(data)

        this.dispatchEvent(
            new CustomEvent('settings', { detail: data })
        )
    }

    clearAllSettings(){
        this.isCompressChecked = false;
        this.isResizeChecked = false;
        this.isWatermarkChecked = false;
        this.clearCompressSettings();
        this.clearResizeSettings();
        this.clearWatermarkSettings();
    }

    compressCheckboxToggel(){
        this.clearCompressSettings();
        if(this.isCompressChecked == true){
            this.isCompressChecked = false;
        }else{
            this.isCompressChecked = true;
            this.defaultQuality();
        }
    }

    clearCompressSettings(){
        this.quality = ''
    }

    defaultQuality(){
        this.quality = '0.2'
    }

    handleQualityChange(event){
        this.quality = event.detail.value;
    }

    resizeCheckboxToggel(){
        this.clearResizeSettings();
        if(this.isResizeChecked == true){
            this.isResizeChecked = false;
        }else{
            this.imageResizeType = 'Standard';
            this.defaultStandardResize();
            this.isResizeChecked = true;
        }
    }

    resizeCheckboxValue(event){
        this.clearResizeSettings();
        this.imageResizeType = event.detail.value;
        if(this.imageResizeType == "Standard"){
            this.defaultStandardResize();
        }else if(this.imageResizeType == "Auto"){
            this.defaultAutoResize();
        }
    }

    clearResizeSettings(){
        this.isStandardChecked = false
        this.imageSize = ''
        this.isAutoChecked = false
        this.imageAutoOption = ''
        this.isPixelsSelected = false
        this.isPercentSelected = false
        this.pixelsHeight = ''
        this.pixelsWidth = ''
        this.percentageHeight = ''
        this.percentageWidth = ''
    }

    defaultStandardResize(){
        this.isAutoChecked = false
        this.isStandardChecked = true;
        this.imageSize = '25'
    }
    
    defaultAutoResize(){
        this.isAutoChecked = true
        this.isPixelsSelected = true
        this.imageAutoOption = 'Pixels'
    }


    handleImageSizeChange(event){
        this.imageSize = event.detail.value;
    }

    resizeCheckboxAutoValueChange(event){
        let autoValue = event.detail.value;
        this.isAutoChecked = true
        if(autoValue == 'Pixels'){
            this.isPixelsSelected = true
            this.isPercentSelected = false
            this.imageAutoOption = 'Pixels'
        }else if(autoValue == 'Percentage'){
            this.isPixelsSelected = false
            this.isPercentSelected = true
            this.imageAutoOption = 'Percentage'
        }
        this.pixelsHeight = ''
        this.pixelsWidth = ''
        this.percentageHeight = ''
        this.percentageWidth = ''
    }

    handlePixelHeightChange(event){
        this.pixelsHeight = event.detail.value;
    }

    handlePixelWidthChange(event){
        this.pixelsWidth = event.detail.value;
    }

    handlePercentHeightChange(event){
        this.percentageHeight = event.detail.value;
    }

    handlePercentWidthChange(event){
        this.percentageWidth = event.detail.value;
    }

    watermarkCheckboxToggel(){
        this.clearWatermarkSettings();
        if(this.isWatermarkChecked == true){
            this.isWatermarkChecked = false;
        }else{
            this.isWatermarkChecked = true;
            this.typeWatermark = 'Text';
            this.defaultTextWaterMark();
        }
    }
    
    watermarkTypeChange(event){
        this.clearWatermarkSettings();
        this.typeWatermark = event.detail.value;
        if(this.typeWatermark == 'Text'){
            this.isTextWatermarkSelected = true;
            this.defaultTextWaterMark();
        }else if(this.typeWatermark == 'Image'){
            this.isImageWatermarkSelected = true;
            this.defaultImageWaterMark();
        }else if(this.typeWatermark == 'TextAndImage'){
            this.isTextWatermarkSelected = true;
            this.isImageWatermarkSelected = true;
            this.defaultTextWaterMark();
            this.defaultImageWaterMark();
        }
    }

    clearWatermarkSettings(){
        this.isTextWatermarkSelected = false;
        this.isImageWatermarkSelected = false;
        this.typeWatermark = '';
        this.fontStyle = ''
        this.fontColor = ''
        this.watermarkTextPosition = ''
        this.watermarkText = ''
        this.boldText = false
        this.italicText = false
        this.dateWatermarkCheckbox = false
        this.watermarkImagePosition = ''
        this.uploadWatermarkImage = ''
        this.uplodedImageName = '';
        this.watermarkImageUploaded = false;
    }
    
    defaultTextWaterMark(){
        this.isTextWatermarkSelected = true;
        this.fontStyle = 'Arial'
        this.fontColor = '#000000'
        this.watermarkTextPosition = 'Top-Left'
        this.boldText = false
        this.italicText = false
        this.dateWatermarkCheckbox = false
    }
   
    defaultImageWaterMark(){
        this.watermarkImagePosition = 'Center'
    }

    handleFontStyleChange(event){
        this.fontStyle = event.detail.value;
    }

    handleFontColorChange(event){
        this.fontColor = event.detail.value;
    }

    handleTextPositionChange(event){
        this.watermarkTextPosition = event.detail.value;
    }

    handleTextChange(event){
        this.watermarkText = event.detail.value;
    }

    handleBoldChange(){
        if(this.boldText == true){
            this.boldText = false
        }else{
            this.boldText = true
        }
    }

    handleItalicChange(){
        if(this.italicText == true){
            this.italicText = false
        }else{
            this.italicText = true
        }
    }

    handleDateChange(){
        if(this.dateWatermarkCheckbox == true){
            this.dateWatermarkCheckbox = false
        }else{
            this.dateWatermarkCheckbox = true
        }
    }

    handleImagePositionChange(event){
        this.watermarkImagePosition = event.detail.value;
    }

    handleImageUploadChange(event){
        const uploadedFile = event.target.files[0];
        console.log(uploadedFile);
        const fileName = uploadedFile.name;
        const lastIndex = fileName.lastIndexOf('.');
        const extension = fileName.slice(lastIndex + 1);
        if(this.accept.includes(extension)){
            this.uplodedImageName = fileName;
            this.uploadWatermarkImage = uploadedFile;
            this.watermarkImageUploaded = true;
            this.watermarkImagePosition = 'Center'
        }else{
            this.showToast('Please upload Image only.', false);
        }
    }

    showToast(message, isSuccess) {
        const event = new ShowToastEvent({
            title: isSuccess?"Success!":"Error!",
            message: message,
            variant: isSuccess?"Success":"Error",
        });

        this.dispatchEvent(event);
    }

}