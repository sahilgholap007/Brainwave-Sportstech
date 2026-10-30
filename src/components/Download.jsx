import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

const Downloads = () => {
  const documents = [
    {
      title: "Court Certification Checklist",
      description: "Complete checklist of requirements for court certification",
      icon: <FileText className="h-6 w-6" />,
      fileName: "pickleball-court-certification-checklist.pdf",
    },
    {
      title: "Certification Guidelines",
      description: "Detailed guidelines for the certification process",
      icon: <FileText className="h-6 w-6" />,
      fileName: "AIPA-Court-Certification-Guidelines.pdf",
    },
    {
      title: "Application Form",
      description: "Printable application form for court certification",
      icon: <FileText className="h-6 w-6" />,
      fileName: "AIPA-Court-Certification-Application.pdf",
    },
    {
      title: "Court Dimensions Diagram",
      description: "Standard court dimensions and layout specifications",
      icon: <FileText className="h-6 w-6" />,
      fileName: "AIPA-Court-Dimensions-Diagram.pdf",
    },
  ]

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">Download Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-[#f39c12] rounded-full p-3 text-white">{doc.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-1">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Downloads
