export declare class ContractTemplateService {
    /**
     * Generate HTML contract template
     */
    static generateHTMLContract(data: {
        contract: any;
        hospital: any;
        application: any;
    }): string;
    /**
     * Generate PDF contract (placeholder - would use a PDF library in production)
     */
    static generatePDFContract(htmlContent: string): Promise<Buffer>;
}
//# sourceMappingURL=contract-template.service.d.ts.map