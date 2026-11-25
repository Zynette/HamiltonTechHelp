from pathlib import Path
import json
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,ListFlowable,ListItem
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("GuideSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("GuideSerif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))
root=Path(__file__).resolve().parents[1]
styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='TitleOT',fontName='GuideSerif',fontSize=27,leading=31,textColor=HexColor('#23473a'),spaceAfter=20));styles.add(ParagraphStyle(name='BodyOT',fontName='GuideSans',fontSize=11,leading=17,spaceAfter=10));styles.add(ParagraphStyle(name='SmallOT',fontName='GuideSans',fontSize=9,leading=13,textColor=HexColor('#45564e')))
def footer(c,d):
 c.setStrokeColor(HexColor('#c4cbbf'));c.line(48,49,564,49);c.setFont('GuideSans',9);c.drawString(48,33,'Online Technical Help  |  onlinetechnicalhelp.com');c.drawRightString(564,33,str(d.page))
for row in json.loads((root/'scripts/content/guides.json').read_text()):
 for lang,ti,bi in [('en',1,3),('fil',2,4)]:
  path=root/f'public/guides/{row[0]}-{lang}.pdf'
  doc=SimpleDocTemplate(str(path),pagesize=(612,792),rightMargin=48,leftMargin=48,topMargin=48,bottomMargin=66,title=row[ti],author='Online Technical Help')
  story=[Paragraph('THE LIVING TECH STUDIO',styles['SmallOT']),Spacer(1,16),Paragraph(row[ti],styles['TitleOT'])]
  for sentence in row[bi].split('. '):story.append(Paragraph('• '+sentence.rstrip('.')+'.',styles['BodyOT']))
  story += [Spacer(1,20),Paragraph('General guidance. Stop and ask for help if a step is unclear.' if lang=='en' else 'Pangkalahatang gabay. Huminto at magtanong kung hindi malinaw ang hakbang.',styles['BodyOT']),Paragraph('Prepared November 24, 2026. Source and further reading:<br/>'+f'<link href="{row[5]}">{row[5]}</link>',styles['SmallOT']),Spacer(1,12),Paragraph('Questions? Describe your goal at onlinetechnicalhelp.com. Scope and price are agreed before paid work.' if lang=='en' else 'May tanong? Ilarawan ang kailangan sa onlinetechnicalhelp.com. Pagkakasunduan ang saklaw at presyo bago ang bayad na trabaho.',styles['SmallOT'])]
  doc.build(story,onFirstPage=footer,onLaterPages=footer)
print('Created 20 bilingual PDF guides.')
