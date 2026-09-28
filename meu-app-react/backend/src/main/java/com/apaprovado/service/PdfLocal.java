package com.apaprovado.service;

import com.apaprovado.model.ImportacaoPdf;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.*;

/** Conservative extraction: ambiguous answers remain blank for human review. */
@Service
public class PdfLocal {
    private final PdfTextReader reader;
    private final ObjectMapper mapper;
    private static final Pattern NUMBER=Pattern.compile("(?iu)^\\s*(?:QUEST[ÃA]O\\s+)?(\\d{1,3})(?:\\s*[.)–-](?:\\s+|$)|\\s+|$)(.*)");
    private static final Pattern OPTION=Pattern.compile("(?:[Ⓐ-Ⓔ]|\\[([A-Ea-e])\\]|\\(([A-Ea-e])\\)|(?<![\\p{L}\\p{N}])([A-E])[.)]\\s+)");
    private static final Pattern ANSWER=Pattern.compile("(?iu)(?<!\\d)(\\d{1,3})\\s*[-.:)]?\\s+(ANULADA|ANULADO|[A-E])(?=\\s|$)");
    public PdfLocal(PdfTextReader reader,ObjectMapper mapper) { this.reader=reader;this.mapper=mapper; }
    public ArrayNode extract(ImportacaoPdf job) throws Exception {
        var prova=reader.read(job.prova);
        Set<String> models=new HashSet<>();
        Pattern modelPattern=Pattern.compile("(?m)(?iu:Modelo|Tipo de Prova)[ \\t]*:?[ \\t]*([A-Z])(?=[ \\t\\r]*(?:$|Pág|Página|Área))");
        for(var page:prova) {var matches=modelPattern.matcher(page.text());while(matches.find()) models.add(matches.group(1).toUpperCase(Locale.ROOT));}
        if(!models.isEmpty() && (models.size()!=1 || !models.contains(job.modelo.toUpperCase(Locale.ROOT))))
            throw new IllegalStateException("O modelo informado não corresponde a um único caderno no PDF. Envie apenas o caderno desejado e informe seu modelo.");
        List<PdfTextReader.Page> key;
        try { key=reader.read(job.gabarito); }
        catch (IllegalStateException e) { key=List.of(); } // A bad answer sheet must not discard the exam.
        return parse(prova,key,job);
    }
    public ArrayNode parse(List<PdfTextReader.Page> pages,List<PdfTextReader.Page> key,ImportacaoPdf job) {
        Map<Integer,String> answers=answers(key,job.modelo);
        Map<Integer,ObjectNode> found=new TreeMap<>();
        StringBuilder block=new StringBuilder(), prefix=new StringBuilder();
        int current=0, pageNumber=1; boolean usedOcr=false;
        String support="", subject="";
        pageLoop: for(var page:pages) {
            String pageText=page.text();
            // ESA puts the circled question number slightly below the first line of its stem.
            if(pageText.matches("(?s).*[Ⓐ-Ⓔ].*")) pageText=pageText.replaceAll("(?m)^([^\\r\\n]+)\\R[ \\t]*(\\d{2})[ \\t]*\\R", "$2 $1\n");
            for(String raw:pageText.split("\\R")) {
                String line=raw.strip();
                if(line.matches("(?iu)^\\d+\\s*[–-]\\s*Quest[õo]es.*")) continue;
                if(line.matches("(?iu).*(?:Pág(?:ina)?\\.?\\s*:?\\s*\\d+|Concurso de Admissão 20\\d\\d).*")) continue;
                if(line.matches("^TEXTO\\s+[IVX]+\\s*$")) {
                    if(current>0 && !OPTION.matcher(block).find()) { block.append(line).append('\n');continue; }
                    if(current>0) add(found,current,pageNumber,block.toString(),support,subject,usedOcr,answers);
                    current=0;block.setLength(0);prefix.setLength(0);support="";
                }
                String section=subject(line);
                if(!section.isEmpty()) {
                    if(current>0) { add(found,current,pageNumber,block.toString(),support,subject,usedOcr,answers); current=0;block.setLength(0); }
                    subject=section;support="";prefix.setLength(0);continue;
                }
                if(line.matches("(?iu)^(?:QUEST[ÃA]O DISCURSIVA.*|PROPOSTA DE REDA[ÇC][ÃA]O|REDA[ÇC][ÃA]O|FOLHA DE RASCUNHO).*$")) break pageLoop;
                Matcher number=NUMBER.matcher(line);
                int n=number.matches()?Integer.parseInt(number.group(1)):0;
                boolean hasOptions=OPTION.matcher(block).find();
                if(current==job.esperadas && n==job.esperadas+1 && hasOptions) break pageLoop;
                // Inside a question, only the immediately following number can start
                // another one. This prevents isolated values in formulas (for example
                // "25") from being mistaken for a later question number.
                if(n>0 && n<=job.esperadas && !found.containsKey(n) && (current==0 || (n==current+1 && hasOptions))) {
                    if(current>0) add(found,current,pageNumber,block.toString(),support,subject,usedOcr,answers);
                    if(current==0 && prefix.length()>100) support=prefix.toString().strip();
                    current=n;pageNumber=page.number();usedOcr=page.ocr();block.setLength(0);
                    block.append(number.group(2)).append('\n');
                } else if(current>0) { block.append(line).append('\n'); usedOcr|=page.ocr(); }
                else prefix.append(line).append('\n');
            }
        }
        if(current>0) add(found,current,pageNumber,block.toString(),support,subject,usedOcr,answers);
        ArrayNode result=mapper.createArrayNode();found.values().forEach(result::add);
        if(result.isEmpty()) throw new IllegalStateException("Não foi possível identificar a numeração e as alternativas. Use uma prova com questões numeradas e confira a qualidade do PDF. Nenhum arquivo foi enviado à IA.");
        return result;
    }
    private void add(Map<Integer,ObjectNode> found,int n,int page,String text,String support,String subject,boolean ocr,Map<Integer,String> answers) {
        Matcher m=OPTION.matcher(text);
        List<Integer> starts=new ArrayList<>(),ends=new ArrayList<>(),letters=new ArrayList<>();
        while(m.find()) {
            char c=m.group().strip().charAt(0); int letter;
            if(c>='Ⓐ'&&c<='Ⓔ') letter=c-'Ⓐ';
            else { String value=m.group(1)!=null?m.group(1):m.group(2)!=null?m.group(2):m.group(3); letter=value.toUpperCase(Locale.ROOT).charAt(0)-'A'; }
            starts.add(m.start());ends.add(m.end());letters.add(letter);
        }
        if(starts.size()<2) return;
        String[] options=new String[5];Arrays.fill(options,"");boolean ambiguous=false;
        for(int i=0;i<starts.size();i++) {
            int letter=letters.get(i); if(!options[letter].isEmpty()) { ambiguous=true;continue; }
            options[letter]=text.substring(ends.get(i),i+1<starts.size()?starts.get(i+1):text.length()).strip();
        }
        ObjectNode q=mapper.createObjectNode();q.put("numero_original",n).put("pagina",page);
        q.put("enunciado",text.substring(0,starts.get(0)).strip());q.put("texto_apoio",support);
        q.put("materia",subject).put("conteudo","").put("dificuldade","Média").put("revisada",false).put("tem_imagem",false);
        ArrayNode opts=q.putArray("opcoes");for(String option:options) opts.add(option);
        String answer=answers.get(n);q.put("anulada","ANULADA".equals(answer));
        if(answer!=null && answer.matches("[A-E]")) q.put("resposta_correta",answer.charAt(0)-'A');else q.putNull("resposta_correta");
        q.put("observacao",(ocr?"Leitura por OCR. ":"Leitura direta do PDF. ")
            +"Confira fórmulas, figuras, textos compartilhados e a separação das alternativas. Conteúdo e dificuldade precisam de revisão. "
            +(answer==null?"Gabarito não identificado com segurança; confira no original. ":"")
            +(ambiguous?"Há marcadores de alternativas repetidos; confira a divisão do texto.":""));
        found.putIfAbsent(n,q);
    }
    private String subject(String line) {
        String s=line.replaceFirst("(?iu)^PROVA DE\\s+","").strip();
        for(String name:List.of("Português","Matemática","História","Geografia","Inglês","Física","Química","Biologia"))
            if(s.equalsIgnoreCase(name)) return name;
        return "";
    }
    public Map<Integer,String> answers(List<PdfTextReader.Page> pages,String model) {
        Map<Integer,String> result=new HashMap<>();Set<Integer> conflicts=new HashSet<>();
        int selected=-1,columns=0;
        for(var page:pages) for(String raw:page.text().split("\\R")) {
            String line=raw.strip();
            Matcher sections=Pattern.compile("(?iu)(GERAL|SA[ÚU]DE|M[ÚU]SICO)\\s*[-–]\\s*([A-Z])").matcher(line);
            List<String> areas=new ArrayList<>(),areaModels=new ArrayList<>();
            while(sections.find()) { areas.add(sections.group(1));areaModels.add(sections.group(2)); }
            if(!areas.isEmpty()) {
                columns=areas.size();selected=-1;
                for(int i=0;i<areas.size();i++)
                    if(areas.get(i).equalsIgnoreCase("GERAL") && areaModels.get(i).equalsIgnoreCase(model)) selected=i;
                continue;
            }
            Matcher models=Pattern.compile("(?iu)(?:MODELO|TIPO(?: DE PROVA)?)\\s*:?\\s*([A-Z0-9]+)").matcher(line);
            List<String> names=new ArrayList<>();while(models.find()) names.add(models.group(1));
            if(!names.isEmpty()) { columns=names.size();selected=-1;for(int i=0;i<names.size();i++) if(names.get(i).equalsIgnoreCase(model)) selected=i;continue; }
            if(columns>0&&selected<0) continue;
            // Bubble sheets show all five letters in text; do not mistake A for the selected mark.
            if(line.matches(".*[Ⓐ-Ⓔ].*") || line.matches(".*\\bA\\s+B\\s+C\\s+D\\s+E\\b.*")) continue;
            Matcher pairs=ANSWER.matcher(line);List<Integer> ns=new ArrayList<>();List<String> values=new ArrayList<>();
            while(pairs.find()) {ns.add(Integer.parseInt(pairs.group(1)));values.add(pairs.group(2).toUpperCase(Locale.ROOT).startsWith("ANUL")?"ANULADA":pairs.group(2).toUpperCase(Locale.ROOT));}
            if(columns>1 && ns.size()!=columns) continue;
            for(int i=0;i<ns.size();i++) {
                if(columns>1&&i!=selected) continue;
                int n=ns.get(i);String value=values.get(i),prev=result.putIfAbsent(n,value);
                if(prev!=null&&!prev.equals(value)) conflicts.add(n);
            }
        }
        conflicts.forEach(result::remove);return result;
    }
}
