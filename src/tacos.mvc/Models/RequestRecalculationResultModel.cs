namespace tacos.mvc.Models
{
    public class RequestRecalculationResultModel
    {
        public double CalculatedTaTotal { get; set; }

        public double CalculatedReaderTotal { get; set; }

        public double AnnualizedTaTotal { get; set; }

        public double AnnualizedReaderTotal { get; set; }

        public double ExceptionAnnualizedTaTotal { get; set; }

        public double ExceptionAnnualizedReaderTotal { get; set; }
    }
}
