import jsPDF from 'jspdf'

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
}
interface DiaConfigurado {
    dia: string;
    quantidade: number;
}

export default function gerarPDF(diasConfigurados:DiaConfigurado[], professor:string, aulas:Aula[], referencias:string[]) {
    const doc = new jsPDF()
    let yPos = 30
    const col1 = 15 // Coluna da data
    const col2 = 45 // Coluna da atividade
    const col3 = 120
    const pageWidth = doc.internal.pageSize.width
    
    yPos += 5

    doc.setFontSize(14);
    doc.text('Dias com Aulas:', 16, yPos);
    yPos += 8;
    doc.setFontSize(12);
    // Listar os dias da semana em que há aula configurada
    if(diasConfigurados.length !== 0 ) {
        diasConfigurados.map(diaConfig => {
        const textExib = `${diaConfig.dia} - ${diaConfig.quantidade} aulas`
        doc.text(textExib, 16, yPos);
        yPos += 8;
        })
    } else {
        doc.text('Nenhum dia configurado',14, yPos)
    }
    doc.setLineWidth(1)
    doc.line(15, 28, pageWidth-15, 28)
    yPos += 5
    

    // Cabeçalho principal
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Planejamento de aula", pageWidth/2, 15, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Professor(a): ${professor}`, pageWidth/2, 23, { align: "center" })
    
    // Linha divisória
    doc.setLineWidth(0.5)
    doc.line(15, 28, pageWidth-15, 28)
    yPos += 8
    // Cabeçalho da tabela
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Data", col1, yPos)
    doc.text("Titulo", col2, yPos)
    doc.text("Conteudo", col3, yPos)
    yPos += 2
    
    // Linha de separação do cabeçalho
    doc.setLineWidth(0.2)
    doc.line(15, yPos, pageWidth-15, yPos)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)

    aulas.forEach((aula) => {
        // Verificar quebra de página
        if(yPos > 280) {
            doc.addPage()
            yPos = 30
        }
        yPos += 5
        // Formatar data
        const data = formatarDataPDF(aula.data)
        const atividade = aula.titulo
        const conteudo = aula.conteudo
        // Adicionar linha da data
        doc.setFont("courier", "normal")
        doc.text(data, col1, yPos)

        // Adicionar atividade
        doc.setFont("helvetica", aula.titulo.includes("AVALIAÇÃO") ? "bold" : "normal")
        const splitText = doc.splitTextToSize(atividade, 65)
        
        splitText.forEach((line: string, index: number) => {
            doc.text(line, col2, yPos + (index * 5))
        })
        
        const splitText2 = doc.splitTextToSize(conteudo, 80);  // 180 é a largura máxima para o texto
        splitText2.forEach((line: string, index: number) => {
            doc.text(line, col3, yPos + (index * 5))
        })

        // Calcular nova posição Y
        yPos += Math.max(splitText.length * 5, splitText2.length * 5,5)
        
        // Linha pontilhada entre atividades
        doc.setLineWidth(0.1)
        doc.setDrawColor(150)
        doc.line(15, yPos, pageWidth-15, yPos)

    })
    yPos += 10

    if (referencias.length > 0) {
        yPos += 10; // Espaçamento antes da seção de referências
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Referências:", 14, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        referencias.forEach((ref, index) => {
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }
        doc.textWithLink(`${index + 1}. ${ref}`, 16, yPos, { url: ref })
        yPos += 10
        })
    }
    doc.save(`Plano de Aulas - ${professor}.pdf`)
}

function formatarDataPDF(date: Date) {
    const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const diaSemana = dias[date.getDay()];
    return `${dia}/${mes} (${diaSemana})`;
}