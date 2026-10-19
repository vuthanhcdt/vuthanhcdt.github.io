import json,sys,re
# y, category, short venue, full venue, title, authors, info, doi, arxiv, extra url, figure, place
P=[
 ("2026","Journal","TSMC","IEEE Transactions on Systems, Man, and Cybernetics: Systems","Toward Adaptive Interaction Strategies for Human Companion Robot via Deep Reinforcement Learning","Cong-Thanh Vu, Yen-Chen Liu","Early Access, pp. 1–14, 2026","10.1109/TSMC.2026.3726038","2609.25031","",""),
 ("2026","Journal","COMPAG","Computers and Electronics in Agriculture","Context-Aware Adaptive Pesticide Spraying for Agricultural Robots under Changing Weather and Terrain Using Vision–Language Models","Cong-Thanh Vu, Yen-Chen Liu","Vol. 252, Art. no. 112092, Sep. 2026","10.1016/j.compag.2026.112092","2610.08807","https://www.sciencedirect.com/science/article/pii/S0168169926006873",""),
 ("2026","Conference","IROS","IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)","Adaptive Companionship for Group-Following Robots: Handling Dynamically Changing Group Formations","Cong-Thanh Vu, Yen-Chen Liu","Pittsburgh, USA, 2026","","2607.01287","",""),
 ("2026","Conference","AIM","IEEE/ASME International Conference on Advanced Intelligent Mechatronics (AIM)","Gimbal-Based Human Tracking for Companion Robots Using Continual Learning","Cong-Thanh Vu, Ching-Chieh Liu, Yen-Chen Liu","pp. 1–6, Genova, Italy, Jul. 2026","10.1109/AIM65483.2026.11658324","","",""),
 ("2026","Conference","AIM","IEEE/ASME International Conference on Advanced Intelligent Mechatronics (AIM)","Multimodal-Language-Model–Driven Interaction and Companionship for Service Robots in Elderly-Care Facilities","Ching-Chieh Liu, Cong-Thanh Vu, Yen-Chen Liu","pp. 1–6, Genova, Italy, Jul. 2026","10.1109/AIM65483.2026.11658058","2608.21387","",""),
 ("2026","Conference","AIM","IEEE/ASME International Conference on Advanced Intelligent Mechatronics (AIM)","Learning Diverse Humanoid Tasks via Synthetic Video Scenarios without Real World Data","Yun-Hao Tsai, Cong-Thanh Vu, Yen-Chen Liu","pp. 1–6, Genova, Italy, Jul. 2026","10.1109/AIM65483.2026.11658152","2607.21648","",""),
 ("2025","Conference","IROS","IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)","Autonomous Adjustment of Tracking Position in Dynamic Environments for Human-Following Robots Using Deep Reinforcement Learning","Cong-Thanh Vu, Yen-Chen Liu","pp. 16863–16869, Hangzhou, China, Oct. 2025","10.1109/IROS60139.2025.11246444","","",""),
 ("2025","Conference","Humanoids","IEEE-RAS International Conference on Humanoid Robots (Humanoids)","Learning Virtual Passive Dynamic Walking Using the Kneed Walker Model for Guiding Policies","Cong-Thanh Vu, Chi-Cheng Lai, Yen-Chen Liu","pp. 1094–1100, Sep. 2025","10.1109/Humanoids65713.2025.11203150","","",""),
 ("2025","Conference","ICCRE","International Conference on Control and Robotics Engineering (ICCRE)","Autonomous Navigation for Human-Following Robots Based on Optimized Position Tracking","Cong-Thanh Vu, Hsin-Hui Huang, Yen-Chen Liu","pp. 23–27, Nagoya, Japan, May 2025","10.1109/ICCRE65455.2025.11093565","","",""),
 ("2024","Conference","RASSE","IEEE International Conference on Recent Advances in Systems Science and Engineering (RASSE)","Toward Autonomous Navigation for Agriculture Robots in Orchard Farming","Cong-Thanh Vu, Hsin-Chia Chen, Yen-Chen Liu","pp. 1–8, Taichung, Taiwan, Nov. 2024","10.1109/RASSE64357.2024.10773736","","",""),
 ("2024","Conference","RoMoCo","International Workshop on Robot Motion and Control (RoMoCo)","Deep Reinforcement Learning for Multi-Robot Local Path Planning in Dynamic Environments","Cong-Thanh Vu, Yen-Chen Liu","pp. 267–272, Poznań, Poland, Jul. 2024","10.1109/RoMoCo60539.2024.10604387","","",""),
 ("2022","Conference","ICISN","Intelligent Systems and Networks (ICISN), LNNS, Springer","Mobile Robot Motion Control Using a Combination of Fuzzy Logic Method and Kinematic Model","Anh-Tu Nguyen, Cong-Thanh Vu","pp. 495–503, Hanoi, Vietnam, 2022","10.1007/978-981-19-3394-3_56","2211.05575","",""),
 ("2022","Conference","AMAS","Advanced Mechanical Engineering, Automation and Sustainable Development (AMAS), LNME, Springer","Obstacle Avoidance for Autonomous Mobile Robots Based on Mapping Method","Anh-Tu Nguyen, Cong-Thanh Vu","pp. 810–816, Ha Long, Vietnam, 2022","10.1007/978-3-030-99666-6_118","2109.06773","",""),
 ("2021","Conference","ICISN","Intelligent Systems and Networks (ICISN), LNNS, Springer","Development of a Multiple-Sensor Navigation System for Autonomous Guided Vehicle Localization","Anh-Tu Nguyen, Van-Truong Nguyen, Xuan-Thuan Nguyen, Cong-Thanh Vu","pp. 402–410, Hanoi, Vietnam, 2021","10.1007/978-981-16-2094-2_49","","",""),
]
def bib(p):
    y,c,s,v,t,a,i,doi,ax,url,fig=p
    last=a.split(',')[0].split()[-1].lower(); w=next(re.sub(r'[^a-z]','',x.lower()) for x in t.split() if len(x)>3)
    key=f"{last}{y}{w}"
    auth=' and '.join(f"{n.split()[-1]}, {' '.join(n.split()[:-1])}" for n in a.split(', '))
    t2=t.replace('–','--')
    if c=='Journal': f=[('title',t2),('author',auth),('journal',v),('year',y)]
    elif c=='Preprint': f=[('title',t2),('author',auth),('journal',f'arXiv preprint arXiv:{ax}'),('year',y)]
    else: f=[('title',t2),('author',auth),('booktitle',v),('year',y)]
    m=re.search(r'Vol\. (\d+)',i); f+= [('volume',m.group(1))] if m else []
    m=re.search(r'pp\. ([\d–]+)',i) or re.search(r'Art\. no\. (\d+)',i); f+= [('pages',m.group(1).replace('–','--'))] if m else []
    if doi: f.append(('doi',doi))
    typ={'Journal':'article','Preprint':'article'}.get(c,'inproceedings')
    return f"@{typ}{{{key},\n"+',\n'.join(f"  {k}={{{x}}}" for k,x in f)+"\n}"
out=[]
for p in P:
    y,c,s,v,t,a,i,doi,ax,url,fig=p
    out.append(dict(y=y,c=c,s=s,v=v,t=t,a=a,i=i,doi=doi,ax=ax,u=url or (f"https://doi.org/{doi}" if doi else f"https://arxiv.org/abs/{ax}"),f=fig,b=bib(p)))
open(sys.argv[1],'w').write('window.PUBS = '+json.dumps(out,ensure_ascii=False,indent=1)+';\n')
print(len(out)); print(out[0]['b']); print(out[-1]['b'])
