import { LightningElement, api } from 'lwc';
import uploadFiles from '@salesforce/apex/AgentforceFileInputController.uploadFiles';

export default class AgentforceInput extends LightningElement {
    @api recordId;

    _value;
    selectedFiles = [];
    contentVersionIds = [];
    isUploading = false;

    @api
    get value() {
        return this._value;
    }

    set value(nextValue) {
        this._value = nextValue;
        this.syncFromValue(nextValue);
    }

    get selectedFileNames() {
        return this.selectedFiles.map((file) => file.name);
    }

    get hasSelectedFiles() {
        return this.selectedFiles.length > 0;
    }

    get hasContentVersionIds() {
        return this.contentVersionIds.length > 0;
    }

    get isUploadDisabled() {
        return this.isUploading || this.selectedFiles.length === 0;
    }

    @api
    getContentVersionIds() {
        return [...this.contentVersionIds];
    }

    handleInputChange(event) {
        event.stopPropagation();
        this.selectedFiles = Array.from(event.target.files || []);
        this.contentVersionIds = [];
        this.notifyValueChange();
    }

    async handleUpload() {
        if (this.isUploadDisabled) {
            return;
        }

        this.isUploading = true;

        try {
            const files = await Promise.all(
                this.selectedFiles.map(async (file) => ({
                    fileName: file.name,
                    base64Data: await this.readFileAsBase64(file),
                    mimeType: file.type
                }))
            );

            const contentVersionIds = await uploadFiles({
                files,
                recordId: this.recordId || null
            });

            this.contentVersionIds = contentVersionIds;
            this.selectedFiles = [];
            this.notifyValueChange();
        } finally {
            this.isUploading = false;
        }
    }

    notifyValueChange() {
        const value = {
            contentVersionIds: this.contentVersionIds.join(',')
        };

        this._value = value;

        this.dispatchEvent(
            new CustomEvent('valuechange', {
                detail: { value },
                bubbles: true,
                composed: true
            })
        );
    }

    syncFromValue(nextValue) {
        const rawIds =
            nextValue && typeof nextValue.contentVersionIds === 'string'
                ? nextValue.contentVersionIds
                : '';
        const parsedIds = rawIds
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);

        if (JSON.stringify(parsedIds) !== JSON.stringify(this.contentVersionIds)) {
            this.contentVersionIds = parsedIds;
        }
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const base64Marker = 'base64,';
                const result = reader.result || '';
                const markerIndex = result.indexOf(base64Marker);

                if (markerIndex === -1) {
                    reject(new Error(`Unable to read file ${file.name}.`));
                    return;
                }

                resolve(result.substring(markerIndex + base64Marker.length));
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }
}
