import { Lesson } from './quizTypes';

export const quizData: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Lesson 1 採血・静脈ルート確保の心構えと解剖（p.1-10）',
    description: '患者さんの心理的負担への配慮や、安全な実施に必要な血管・神経の解剖学的知識を学びます。',
    questions: [
      {
        id: 'q1-1',
        questionText: '採血や静脈ルート確保において、技術以前に最も大切にすべきことは何ですか？',
        options: [
          { id: 'a', text: '素早く終わらせること', isCorrect: false },
          { id: 'b', text: '患者さんの不安や恐怖心に寄り添うこと', isCorrect: true },
          { id: 'c', text: '必ず一回で成功させること', isCorrect: false },
          { id: 'd', text: '最新の器具を使用すること', isCorrect: false },
        ],
        explanation: '侵襲を伴う処置では、患者さんは「痛い」「怖い」という感情を持っています。その気持ちに寄り添い、少しでも安楽に実施しようとする姿勢が最も重要です。(書籍 p.2 参照)',
      },
      {
        id: 'q1-2',
        questionText: '肘窩（肘の内側）で一般的に選択される血管のうち、最も太く穿刺しやすいとされるのは？',
        options: [
          { id: 'a', text: '尺側皮静脈', isCorrect: false },
          { id: 'b', text: '橈側皮静脈', isCorrect: false },
          { id: 'c', text: '肘正中皮静脈', isCorrect: true },
          { id: 'd', text: '上腕動脈', isCorrect: false },
        ],
        explanation: '肘正中皮静脈は他の皮静脈と交通しており、太く怒張しやすいため、第一選択となることが多い血管です。(書籍 p.4 参照)',
      },
      {
        id: 'q1-3',
        questionText: '穿刺に伴う神経損傷のリスクが高い部位はどこですか？',
        options: [
          { id: 'a', text: '肘正中皮静脈の外側', isCorrect: false },
          { id: 'b', text: '手首の橈側（親指側）', isCorrect: true },
          { id: 'c', text: '前腕の内側', isCorrect: false },
          { id: 'd', text: '肘窩の尺側', isCorrect: false },
        ],
        explanation: '手首の親指側（橈骨神経浅枝）付近は神経が浅い位置を走行しており、穿刺による神経損傷（痺れや痛み）のリスクが高いため注意が必要です。(書籍 p.6 参照)',
      },
      {
        id: 'q1-4',
        questionText: '動脈と静脈を見分けるポイントとして正しいものは？',
        options: [
          { id: 'a', text: '動脈は拍動がある', isCorrect: true },
          { id: 'b', text: '静脈は拍動がある', isCorrect: false },
          { id: 'c', text: '動脈は青く見える', isCorrect: false },
          { id: 'd', text: '静脈は深いところにある', isCorrect: false },
        ],
        explanation: '動脈は心臓の拍動に合わせてドクンドクンと脈打ちます。穿刺前には必ず指で触れて拍動の有無を確認し、動脈誤穿刺を防ぎます。(書籍 p.7 参照)',
      },
      {
        id: 'q1-5',
        questionText: '安全な採血のために、著者が推奨している「準備」のポイントは？',
        options: [
          { id: 'a', text: '必要物品をトレイに山積みにする', isCorrect: false },
          { id: 'b', text: '使用する順番に、利き手側に配置する', isCorrect: true },
          { id: 'c', text: '物品は患者さんの見えないところに隠す', isCorrect: false },
          { id: 'd', text: 'アルコール綿は袋から出さないでおく', isCorrect: false },
        ],
        explanation: 'スムーズな手技は事故防止につながります。物品を使用する順に並べ、利き手側（右利きなら右側）に配置することで、無駄な動きをなくせます。(書籍 p.9 参照)',
      },
      {
        id: 'q1-6',
        questionText: '穿刺時の緊張を和らげるために、著者が推奨する呼吸法（メンタル調整）は？',
        options: [
          { id: 'a', text: '浅く速い呼吸を繰り返す', isCorrect: false },
          { id: 'b', text: '息を止めて集中する', isCorrect: false },
          { id: 'c', text: 'お腹に手を当てて腹式呼吸', isCorrect: true },
          { id: 'd', text: '口呼吸のみで行う', isCorrect: false },
        ],
        explanation: '緊張すると呼吸が浅くなりがちです。意識的に深くゆっくりとした呼吸（ボックスブリージングなど）を行うことで、副交感神経を優位にし、リラックスした状態で手技に臨めます。(書籍 p.4 参照)',
      },
      {
        id: 'q1-7',
        questionText: '肘窩において、正中神経と伴走しており、誤穿刺のリスクがある動脈はどれですか？',
        options: [
          { id: 'a', text: '橈骨動脈', isCorrect: false },
          { id: 'b', text: '尺骨動脈', isCorrect: false },
          { id: 'c', text: '上腕動脈', isCorrect: true },
          { id: 'd', text: '大動脈', isCorrect: false },
        ],
        explanation: '肘窩の深部には上腕動脈と正中神経が走行しています。特に尺側皮静脈の深部には注意が必要で、動脈拍動の確認と神経走行のイメージが重要です。(書籍 p.7 参照)',
      },
      {
        id: 'q1-8',
        questionText: '皮下脂肪が厚い患者さんの場合、血管の深さは一般的にどうなりますか？',
        options: [
          { id: 'a', text: '非常に浅くなる', isCorrect: false },
          { id: 'b', text: '深くなり、見えにくくなることが多い', isCorrect: true },
          { id: 'c', text: '変わらない', isCorrect: false },
          { id: 'd', text: '脂肪の上に浮いてくる', isCorrect: false },
        ],
        explanation: '皮下脂肪が厚いと血管はその下に埋もれてしまい、深くて見えにくくなります。この場合、視診よりも触診（弾力の確認）が重要になります。(書籍 p.5 関連)',
      },
      {
        id: 'q1-9',
        questionText: '穿刺時に患者さんが「ビリッ」と電気が走るような強い痛みを訴えた場合、最も疑われる状況は？',
        options: [
          { id: 'a', text: '血管が逃げた', isCorrect: false },
          { id: 'b', text: '神経に触れた（神経損傷の疑い）', isCorrect: true },
          { id: 'c', text: '駆血帯がきつすぎる', isCorrect: false },
          { id: 'd', text: 'アルコールが染みた', isCorrect: false },
        ],
        explanation: '放散痛（ビリビリする痛み）は神経損傷の典型的なサインです。直ちに抜針し、医師に報告・対応する必要があります。(書籍 p.6 参照)',
      },
      {
        id: 'q1-10',
        questionText: '採血しやすい環境を作るために、室温調整以外で著者が推奨していることは？',
        options: [
          { id: 'a', text: 'BGMを大音量で流す', isCorrect: false },
          { id: 'b', text: '照明を明るくし、手元が見えやすいようにする', isCorrect: true },
          { id: 'c', text: '窓を全開にする', isCorrect: false },
          { id: 'd', text: 'アロマを焚く', isCorrect: false },
        ],
        explanation: '血管をよく観察するためには十分な明るさが必要です。薄暗い病室などでは照明を追加したり、処置灯を使用することで成功率が上がります。(書籍 p.2 関連)',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Lesson 2 穿刺する前に押さえておきたいこと（p.11-28）',
    description: '穿刺時の適切な姿勢、効果的な駆血帯の巻き方、確実な静脈血管の固定手技について学びます。',
    questions: [
      {
        id: 'q2-1',
        questionText: '血管を選ぶ際、目で見る（視診）だけでなく、必ず行うべき重要な確認動作はどれですか？',
        options: [
          { id: 'a', text: '聴診器で血流音を聞く（聴診）', isCorrect: false },
          { id: 'b', text: '指先で触れて弾力や深さを確認する（触診）', isCorrect: true },
          { id: 'c', text: '強く叩いて反射を見る（打診）', isCorrect: false },
          { id: 'd', text: '定規で血管の長さを測る', isCorrect: false },
        ],
        explanation: '血管選びにおいては、目で見て走行を確認するだけでなく、指先で触れて「弾力（跳ね返り）」や「深さ」、「硬さ」を確認する（触診）ことが不可欠です。見えている血管でも必ず触れて確認します。(書籍 p.12-13 参照)',
      },
      {
        id: 'q2-2',
        questionText: '穿刺者が右利きの場合、患者さんの「左腕」に穿刺する際にアプローチしやすくする工夫は？',
        options: [
          { id: 'a', text: '患者さんの上肢を外転（外側に開く）させる', isCorrect: true },
          { id: 'b', text: '患者さんに身体をひねってもらう', isCorrect: false },
          { id: 'c', text: '自分が無理な体勢をとる', isCorrect: false },
          { id: 'd', text: 'ベッド柵を乗り越える', isCorrect: false },
        ],
        explanation: '右利きの看護師が左側のベッドサイドから左腕に穿刺する場合、そのままでは窮屈になります。上肢を少し外転してもらうことで、位置関係が調整され、穿刺しやすくなります。(書籍 p.15 参照)',
      },
      {
        id: 'q2-3',
        questionText: '駆血帯を巻く適切な位置は、穿刺予定部位からどのくらい中枢側（心臓側）ですか？',
        options: [
          { id: 'a', text: '直上（すぐ上）', isCorrect: false },
          { id: 'b', text: '7〜10cm', isCorrect: true },
          { id: 'c', text: '20cm以上', isCorrect: false },
          { id: 'd', text: '手首', isCorrect: false },
        ],
        explanation: '穿刺部位から約7〜10cm中枢側に巻くのが適切です。近すぎると血管がつぶれて穿刺しにくくなり、遠すぎると怒張効果が弱まります。(書籍 p.18 参照)',
      },
      {
        id: 'q2-4',
        questionText: '動脈血流を遮断せず、静脈だけを怒張させる適切な駆血圧の目安は？',
        options: [
          { id: 'a', text: '橈骨動脈の拍動が消失する強さ', isCorrect: false },
          { id: 'b', text: '橈骨動脈の拍動が触れる程度の強さ', isCorrect: true },
          { id: 'c', text: '痛みを伴うほどの強さ', isCorrect: false },
          { id: 'd', text: '皮膚が変色するほどの強さ', isCorrect: false },
        ],
        explanation: '駆血の目的は静脈還流を止めることです。動脈まで止めてしまうと末梢に血が行かず血管が虚脱します。動脈の拍動が触れる強さが適切です。(書籍 p.21 参照)',
      },
      {
        id: 'q2-5',
        questionText: '駆血帯の種類として、著者が推奨しているタイプとその理由は？',
        options: [
          { id: 'a', text: 'チューブ型（皮膚にくい込みやすく固定が強い）', isCorrect: false },
          { id: 'b', text: 'バンド型（皮膚への負担が少なく、ワンタッチで操作できる）', isCorrect: true },
          { id: 'c', text: '紐（安価である）', isCorrect: false },
          { id: 'd', text: '血圧計のマンシェット（圧が正確）', isCorrect: false },
        ],
        explanation: 'バンド型は幅広で皮膚に食い込みにくく、痛みやスキンテア（皮膚裂傷）のリスクを減らせます。また、リリースボタンで簡単に外せるため操作性も優れています。(書籍 p.22 参照)',
      },
      {
        id: 'q2-6',
        questionText: '高齢者など皮膚が脆弱な患者さんに駆血帯を巻く際、スキンテア（皮膚裂傷）を防ぐための工夫は？',
        options: [
          { id: 'a', text: 'できるだけきつく巻く', isCorrect: false },
          { id: 'b', text: '寝衣（服）の上から巻く、またはタオルなどを当てて保護する', isCorrect: true },
          { id: 'c', text: '駆血帯を使用しない', isCorrect: false },
          { id: 'd', text: '粘着テープで固定する', isCorrect: false },
        ],
        explanation: '皮膚が薄い高齢者では、駆血帯の摩擦や圧力で皮膚が剥離することがあります。直接皮膚に巻かず、衣服の上や保護布の上から巻くことで予防します。(書籍 p.22 参照)',
      },
      {
        id: 'q2-7',
        questionText: '駆血時間は原則として何分以内にするのが望ましいですか？',
        options: [
          { id: 'a', text: '1分以内', isCorrect: true },
          { id: 'b', text: '3分以内', isCorrect: false },
          { id: 'c', text: '5分以内', isCorrect: false },
          { id: 'd', text: '10分以内', isCorrect: false },
        ],
        explanation: '長時間駆血すると、血液濃縮により検査値（カリウムやタンパク質など）に影響が出たり、しびれや点状出血の原因になります。原則1分以内を目安に行います。(書籍 p.23 参照)',
      },
      {
        id: 'q2-8',
        questionText: '穿刺時の「皮膚の固定（伸展）」の主な目的は？',
        options: [
          { id: 'a', text: '血管を温めるため', isCorrect: false },
          { id: 'b', text: '痛みを増強させるため', isCorrect: false },
          { id: 'c', text: '血管が逃げるのを防ぎ、皮膚を緊張させて針を刺さりやすくするため', isCorrect: true },
          { id: 'd', text: '駆血の効果を高めるため', isCorrect: false },
        ],
        explanation: '親指で皮膚を手前（末梢側）に引くことで、血管を固定して逃げにくくすると同時に、皮膚にテンションをかけて針がスパッと入るようにします。これにより痛みも軽減されます。(書籍 p.24 参照)',
      },
      {
        id: 'q2-9',
        questionText: '皮膚を固定する際、親指はどこに置くのが適切ですか？',
        options: [
          { id: 'a', text: '穿刺点の真上', isCorrect: false },
          { id: 'b', text: '穿刺点の数cm手前（末梢側）', isCorrect: true },
          { id: 'c', text: '穿刺点の横', isCorrect: false },
          { id: 'd', text: '穿刺点より中枢側', isCorrect: false },
        ],
        explanation: '穿刺点の数cm手前に親指を置き、下方向（末梢方向）へ皮膚を引っ張ります。穿刺の邪魔にならず、かつ十分にテンションがかかる位置です。(書籍 p.24 参照)',
      },
      {
        id: 'q2-10',
        questionText: '静脈血管の固定において、引っ張る方向として正しいのは？',
        options: [
          { id: 'a', text: '血管に対して横方向', isCorrect: false },
          { id: 'b', text: '血管の走行に沿って、末梢側（手前）へ引っ張る', isCorrect: true },
          { id: 'c', text: '天井方向へ持ち上げる', isCorrect: false },
          { id: 'd', text: '中枢側（奥）へ押し込む', isCorrect: false },
        ],
        explanation: '基本は血管の走行に沿って、自分の方（末梢側）へまっすぐ引っ張ります。これにより血管が直線的になり、固定も安定します。(書籍 p.24 参照)',
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Lesson 3 針の選択と穿刺方法（p.29-42）',
    description: '直針と翼状針の違い、適切なゲージの選択、痛くない穿刺角度や逆血確認のコツを学びます。',
    questions: [
      {
        id: 'q3-1',
        questionText: '採血針の刃面（カット面）は、通常どちらに向けて穿刺しますか？',
        options: [
          { id: 'a', text: '下向き（皮膚側）', isCorrect: false },
          { id: 'b', text: '上向き（天井側）', isCorrect: true },
          { id: 'c', text: '横向き', isCorrect: false },
          { id: 'd', text: 'どちらでも良い', isCorrect: false },
        ],
        explanation: '刃面を上に向けることで、鋭利な先端が皮膚にスムーズに入り、痛みを最小限に抑えられます。また、血管壁を切るリスクも減ります。(書籍 p.30 参照)',
      },
      {
        id: 'q3-2',
        questionText: '針の太さを表すゲージ（G）について、正しい説明は？',
        options: [
          { id: 'a', text: '数字が大きいほど針は太い', isCorrect: false },
          { id: 'b', text: '数字が大きいほど針は細い（例：23Gは21Gより細い）', isCorrect: true },
          { id: 'c', text: '数字と太さは無関係', isCorrect: false },
          { id: 'd', text: 'すべて同じ太さである', isCorrect: false },
        ],
        explanation: 'ゲージ（G）の数字が大きいほど針は細くなります。通常、採血では21G〜23Gが使用されます。(書籍 p.31 参照)',
      },
      {
        id: 'q3-3',
        questionText: '浅い血管に対して、角度をつけすぎ（45度以上など）で刺入するとどうなるリスクがありますか？',
        options: [
          { id: 'a', text: '血管の手前で止まる', isCorrect: false },
          { id: 'b', text: '血管を貫通（突き抜ける）してしまう', isCorrect: true },
          { id: 'c', text: '痛みがなくなる', isCorrect: false },
          { id: 'd', text: '血液が逆流する', isCorrect: false },
        ],
        explanation: '浅い血管に急な角度で刺すと、針先が血管内腔に留まらず、すぐに対側の血管壁を突き破ってしまいます。浅い血管ほど寝かせて刺す必要があります。(書籍 p.32 参照)',
      },
      {
        id: 'q3-4',
        questionText: '痛くない駆血帯の外し方として推奨されるのは？',
        options: [
          { id: 'a', text: '一気にパチンと外す', isCorrect: false },
          { id: 'b', text: '皮膚を挟まないように指を添えて、ゆっくり緩める', isCorrect: true },
          { id: 'c', text: 'ハサミで切る', isCorrect: false },
          { id: 'd', text: '患者さんに外してもらう', isCorrect: false },
        ],
        explanation: 'ゴムバンドなどを勢いよく外すと皮膚を弾いて痛みを伴います。ロックを外す際は指を添えて衝撃を和らげる配慮が必要です。(書籍 p.33 参照)',
      },
      {
        id: 'q3-5',
        questionText: '直針（注射針）と比較した際の「翼状針」の最大のメリットは？',
        options: [
          { id: 'a', text: 'コストが安い', isCorrect: false },
          { id: 'b', text: '羽を持って操作でき、角度を浅く保ちやすく固定しやすい', isCorrect: true },
          { id: 'c', text: '針が太い', isCorrect: false },
          { id: 'd', text: '逆血が見えない', isCorrect: false },
        ],
        explanation: '翼状針は羽を持つことで指先での繊細な操作が可能で、特に細い血管や浅い血管に対して角度を寝かせて刺入しやすいのが特徴です。(書籍 p.34 参照)',
      },
      {
        id: 'q3-6',
        questionText: '真空管採血ホルダーを使用時、逆血が見えにくい場合に確認する方法として適切なのは？',
        options: [
          { id: 'a', text: '針を抜いて確認する', isCorrect: false },
          { id: 'b', text: '一度採血管を少し差し込んでみて、血液が流入するか確認する', isCorrect: true },
          { id: 'c', text: '駆血帯を外す', isCorrect: false },
          { id: 'd', text: '針を回転させる', isCorrect: false },
        ],
        explanation: '逆血が見にくい場合、採血管をホルダーにセットして陰圧をかけることで、血管に入っていれば血液が勢いよく流入してきます。ただし、入っていなければ陰圧が失われるため予備の管が必要です。(書籍 p.33 関連)',
      },
      {
        id: 'q3-7',
        questionText: '注射針のゲージ（太さ）と「ハブ（針基）の色」の組み合わせで、一般的な規格（JIS/ISO）は？',
        options: [
          { id: 'a', text: '21G＝ピンク、22G＝青', isCorrect: false },
          { id: 'b', text: '21G＝緑、22G＝黒、23G＝青（または水色）', isCorrect: true },
          { id: 'c', text: '21G＝黄色、22G＝赤', isCorrect: false },
          { id: 'd', text: '色は決まっていない', isCorrect: false },
        ],
        explanation: '針の太さは色で識別できるよう規格化されています。一般的に21Gは緑、22Gは黒、23Gは青（水色）です。太さを瞬時に判断するために覚えておくと便利です。(書籍 p.31 関連)',
      },
      {
        id: 'q3-8',
        questionText: '真空管採血ではなく「注射器（シリンジ）採血」を選択する主なメリットは？',
        options: [
          { id: 'a', text: '片手で操作できる', isCorrect: false },
          { id: 'b', text: '手動で陰圧（引く力）を調整できるため、細い血管でも潰れにくい', isCorrect: true },
          { id: 'c', text: '準備する物品が少ない', isCorrect: false },
          { id: 'd', text: '針刺し事故のリスクがない', isCorrect: false },
        ],
        explanation: '真空管は一定の強い陰圧がかかるため、細い血管だと血管壁が吸い付いて閉塞したり、溶血することがあります。シリンジなら引き具合で圧を調整できます。(書籍 p.38 参照)',
      },
      {
        id: 'q3-9',
        questionText: '翼状針を使用して真空管採血を行う際、チューブ内の空気（デッドスペース）はどう影響しますか？',
        options: [
          { id: 'a', text: '影響はない', isCorrect: false },
          { id: 'b', text: '1本目の採血量が空気の分だけ少なくなる（約0.4mL程度）', isCorrect: true },
          { id: 'c', text: '血液が固まりやすくなる', isCorrect: false },
          { id: 'd', text: '検査データが異常高値になる', isCorrect: false },
        ],
        explanation: '翼状針のチューブ内には空気が入っており、最初のスピッツにその空気が流入するため、規定量まで血液が入らないことがあります。凝固検査など厳密な量が必要な場合はダミー管で空気を抜く必要があります。(書籍 p.34 関連)',
      },
      {
        id: 'q3-10',
        questionText: '真空管採血ホルダーの取り扱いについて、感染予防の観点から正しいのは？',
        options: [
          { id: 'a', text: '汚れていなければ使い回してもよい', isCorrect: false },
          { id: 'b', text: 'アルコールで拭けば再利用可能', isCorrect: false },
          { id: 'c', text: '原則として患者ごとの「単回使用（ディスポーザブル）」である', isCorrect: true },
          { id: 'd', text: '滅菌すれば永久に使える', isCorrect: false },
        ],
        explanation: 'ホルダーは血液が付着するリスクがあり、使い回しによる交差感染が問題視されています。現在は患者ごとに使い捨てるタイプ（または針と一体型）が標準的です。(書籍 p.39 関連)',
      },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Lesson 4 穿刺の基本テクニック（p.43-52）',
    description: '針の持ち方、刺入角度、視線の位置など、正確な穿刺を行うための基本動作を学びます。',
    questions: [
      {
        id: 'q4-1',
        questionText: '一般的な皮静脈への穿刺角度の目安は？',
        options: [
          { id: 'a', text: 'ほぼ0度', isCorrect: false },
          { id: 'b', text: '15〜20度', isCorrect: true },
          { id: 'c', text: '45度', isCorrect: false },
          { id: 'd', text: '90度', isCorrect: false },
        ],
        explanation: '皮膚に対して15〜20度くらいの角度で刺入するのが一般的です。深さによって調整しますが、角度が急すぎると血管を貫通してしまいます。(書籍 p.44 参照)',
      },
      {
        id: 'q4-2',
        questionText: '針を持つ手（利き手）の安定性を高めるための工夫は？',
        options: [
          { id: 'a', text: '脇を開いて大きく構える', isCorrect: false },
          { id: 'b', text: '小指や薬指を患者の腕に軽く添えて支点を作る', isCorrect: true },
          { id: 'c', text: '腕を空中に浮かせる', isCorrect: false },
          { id: 'd', text: '手首を固定しない', isCorrect: false },
        ],
        explanation: '空中で針を持つと手が震えやすくなります。小指球（手の小指側の側面）や指を患者さんの腕に軽く当てて支点にすることで、針先が安定します。(書籍 p.48 参照)',
      },
      {
        id: 'q4-3',
        questionText: '穿刺時の目線はどこに向けるべきですか？',
        options: [
          { id: 'a', text: '針の全体', isCorrect: false },
          { id: 'b', text: '針先と血管の刺入点', isCorrect: true },
          { id: 'c', text: '患者さんの顔', isCorrect: false },
          { id: 'd', text: '採血スピッツ', isCorrect: false },
        ],
        explanation: '針先が皮膚に触れ、血管に入っていく瞬間を見逃さないよう、針先と刺入点に集中します。逆血確認の際は視線をハブに移しますが、刺入時は針先です。(書籍 p.50 参照)',
      },
      {
        id: 'q4-4',
        questionText: '「切れない針」を使うとどうなりますか？',
        options: [
          { id: 'a', text: '痛みが少ない', isCorrect: false },
          { id: 'b', text: '血管が逃げやすく、痛みも強い', isCorrect: true },
          { id: 'c', text: '成功率が上がる', isCorrect: false },
          { id: 'd', text: '何も変わらない', isCorrect: false },
        ],
        explanation: '切れ味の悪い針や、一度失敗して先端が潰れた針を使うと、皮膚抵抗が大きくなり痛みが強い上、血管が押し潰されて逃げやすくなります。失敗したら新しい針に変えるのが原則です。(書籍 p.46 参照)',
      },
      {
        id: 'q4-5',
        questionText: '穿刺のスピードについて、著者の推奨は？',
        options: [
          { id: 'a', text: 'できるだけゆっくりじわじわ刺す', isCorrect: false },
          { id: 'b', text: 'ためらわず、ある程度の速さでスッと刺す', isCorrect: true },
          { id: 'c', text: '目にも止まらぬ速さで刺す', isCorrect: false },
          { id: 'd', text: 'リズムよく何度も刺す', isCorrect: false },
        ],
        explanation: 'ゆっくりすぎると痛みの時間が長く、血管も逃げやすくなります。「スッ」と一定の速度で刺入することで、痛みを最小限に抑えられます。(書籍 p.51 参照)',
      },
      {
        id: 'q4-6',
        questionText: '直針（注射針）と翼状針を比較した研究において、翼状針の方が優れているとされる点は？',
        options: [
          { id: 'a', text: 'コストが低い', isCorrect: false },
          { id: 'b', text: '採血成功率が高く、神経損傷リスクが低い', isCorrect: true },
          { id: 'c', text: '準備が簡単である', isCorrect: false },
          { id: 'd', text: '廃棄が容易である', isCorrect: false },
        ],
        explanation: '翼状針は直針に比べて採血成功率が高く、患者の不快感が低いという報告があります。また、神経損傷の発生リスクを約6分の1に低減できたという研究結果もあります。(書籍 p.45 table 3-1 参照)',
      },
      {
        id: 'q4-7',
        questionText: '直針で採血ホルダーを使用する場合、穿刺後の安定した固定方法は？',
        options: [
          { id: 'a', text: 'ホルダーの端を小指だけで持つ', isCorrect: false },
          { id: 'b', text: '示指（人差し指）で針基（ハブ）を固定し、他の指でホルダーを把持する', isCorrect: true },
          { id: 'c', text: '両手でホルダーを持つ', isCorrect: false },
          { id: 'd', text: '固定せず、手を離す', isCorrect: false },
        ],
        explanation: '針先が動かないようにするため、示指で針基を皮膚に押し当てるように固定し、中指・薬指・小指でホルダーを支えるのが基本です。これによりスピッツ交換時のブレを防げます。(書籍 p.48 fig.4-4 参照)',
      },
      {
        id: 'q4-8',
        questionText: '翼状針を刺入した後、針が抜けないようにするための適切な処置は？',
        options: [
          { id: 'a', text: '指でずっと押さえておく', isCorrect: false },
          { id: 'b', text: '羽やチューブをテープで皮膚に固定する', isCorrect: true },
          { id: 'c', text: '患者さんに持ってもらう', isCorrect: false },
          { id: 'd', text: '接着剤を使う', isCorrect: false },
        ],
        explanation: '翼状針はチューブが何かに引っかかると抜けやすいため、刺入後は速やかに羽とチューブをテープで固定し、不用意な抜針を防ぎます。(書籍 p.48 fig.4-4 参照)',
      },
      {
        id: 'q4-9',
        questionText: '深い位置にある血管を穿刺する場合、針の角度はどう調整すべきですか？',
        options: [
          { id: 'a', text: 'さらに寝かせて、ほぼ0度にする', isCorrect: false },
          { id: 'b', text: '通常（15〜20度）よりやや立てて（約30度など）、距離を短くする', isCorrect: true },
          { id: 'c', text: '90度で刺す', isCorrect: false },
          { id: 'd', text: '浅い血管と同じ角度でよい', isCorrect: false },
        ],
        explanation: '深い血管に対して浅い角度で刺すと、血管に到達するまでの皮下距離が長くなりすぎます。やや角度をつけて刺入し、血管に届いたら角度を戻して進めるテクニックが必要です。(書籍 p.44 関連)',
      },
      {
        id: 'q4-10',
        questionText: '穿刺時に「失敗するかも」と弱気になったり、ためらいがあると生じやすい弊害は？',
        options: [
          { id: 'a', text: '逆に慎重になって成功率が上がる', isCorrect: false },
          { id: 'b', text: '手が震えたり、思い切りのない操作になり、痛みが増したり血管が逃げやすくなる', isCorrect: true },
          { id: 'c', text: '患者さんが安心する', isCorrect: false },
          { id: 'd', text: '時間が短縮される', isCorrect: false },
        ],
        explanation: 'メンタルは手技に直結します。不安や迷いは手の震えや不十分な刺入速度につながり、結果として失敗の原因になります。「よし、いける！」と自己暗示をかけることも重要です。(書籍 p.50 関連)',
      },
    ],
  },
  {
    id: 'lesson-5',
    title: 'Lesson 5 肘での採血と神経・動脈の走行（p.53-66）',
    description: '逆血確認の基本に加え、肘窩における静脈・動脈・神経の解剖学的走行と、誤穿刺・神経損傷リスクについて学びます。',
    questions: [
      {
        id: 'q5-1',
        questionText: '真空管採血ホルダーを使用する場合、逆血はどこで確認しますか？',
        options: [
          { id: 'a', text: '確認できない', isCorrect: false },
          { id: 'b', text: '針を刺した瞬間にホルダー内の針の根元（透明ゴム部分など）を見る', isCorrect: true },
          { id: 'c', text: 'スピッツを刺してから確認する', isCorrect: false },
          { id: 'd', text: '患者さんに聞く', isCorrect: false },
        ],
        explanation: '現在は逆血確認機能付きの針やホルダーが普及しています。針の根元やフラッシュバックチャンバーに血液が返ってくるのを見て、血管確保を確認します。(書籍 p.54 参照)',
      },
      {
        id: 'q5-2',
        questionText: '逆血を確認した後、最初に行うべき動作は？',
        options: [
          { id: 'a', text: 'すぐに採血スピッツを刺す', isCorrect: false },
          { id: 'b', text: '針の角度を寝かせて、数ミリ進める', isCorrect: true },
          { id: 'c', text: '針を抜く', isCorrect: false },
          { id: 'd', text: '駆血帯を外す', isCorrect: false },
        ],
        explanation: '逆血が来た時点では、針の刃面の一部しか血管に入っていない可能性があります。角度を寝かせて少し進めることで、針先全体を確実に血管内に収めます。(書籍 p.58 参照)',
      },
      {
        id: 'q5-3',
        questionText: '針を「寝かせる」理由として正しいものは？',
        options: [
          { id: 'a', text: '患者さんが見やすいように', isCorrect: false },
          { id: 'b', text: '針先で血管の後壁（反対側の壁）を突き破らないようにするため', isCorrect: true },
          { id: 'c', text: '血液の流れを止めるため', isCorrect: false },
          { id: 'd', text: '針を固定しやすくするため', isCorrect: false },
        ],
        explanation: '刺入した角度のまま進めると、血管の裏側（後壁）を貫通してしまいます。血管と平行になるように角度を小さく（寝かせて）してから進めるのが鉄則です。(書籍 p.59 参照)',
      },
      {
        id: 'q5-4',
        questionText: '採血中、血液の出が悪くなった場合の対処として不適切なものは？',
        options: [
          { id: 'a', text: '針の角度を微調整する', isCorrect: false },
          { id: 'b', text: '針を深く刺し直す', isCorrect: true },
          { id: 'c', text: '駆血帯を巻き直す（緩んでいないか確認）', isCorrect: false },
          { id: 'd', text: 'スピッツを交換してみる（真空圧不足の可能性）', isCorrect: false },
        ],
        explanation: '深く刺し直そうとすると血管を貫通したり、組織を損傷するリスクがあります。まずは針先が血管壁に当たっていないか、角度や向きを微調整するのが安全です。(書籍 p.62 参照)',
      },
      {
        id: 'q5-5',
        questionText: '採血終了時、抜針のタイミングは？',
        options: [
          { id: 'a', text: '駆血帯を巻いたまま抜く', isCorrect: false },
          { id: 'b', text: '駆血帯を外し、スピッツも抜いてから、針を抜く', isCorrect: true },
          { id: 'c', text: 'スピッツを刺したまま抜く', isCorrect: false },
          { id: 'd', text: '患者さんに深呼吸してもらってから抜く', isCorrect: false },
        ],
        explanation: '駆血帯を外して血管内圧を下げ、スピッツも抜いて（陰圧を解除して）から抜針します。そうしないと血液が噴出したり、血腫（内出血）の原因になります。(書籍 p.65 参照)',
      },
      {
        id: 'q5-6',
        questionText: '「尺側皮静脈」の深部を走行しており、誤穿刺による損傷リスクがある神経はどれですか？',
        options: [
          { id: 'a', text: '橈骨神経', isCorrect: false },
          { id: 'b', text: '正中神経', isCorrect: false },
          { id: 'c', text: '内側前腕皮神経', isCorrect: true },
          { id: 'd', text: '尺骨神経', isCorrect: false },
        ],
        explanation: '尺側皮静脈（小指側の静脈）の近くには内側前腕皮神経が走行しており、一部では静脈の上を通っていることもあります。ここを穿刺してしびれが出た場合は、この神経の損傷が疑われます。(書籍 p.58 fig.5-3 参照)',
      },
      {
        id: 'q5-7',
        questionText: '肘窩において、神経や動脈の損傷リスクが最も低く、第一選択として推奨される血管は？',
        options: [
          { id: 'a', text: '尺側皮静脈', isCorrect: false },
          { id: 'b', text: '肘正中皮静脈', isCorrect: true },
          { id: 'c', text: '上腕静脈', isCorrect: false },
          { id: 'd', text: '橈骨動脈', isCorrect: false },
        ],
        explanation: '肘正中皮静脈は太く、比較的表層にあり、周囲に太い神経や動脈が密接していないため、最も安全な穿刺部位とされています。(書籍 p.62 参照)',
      },
      {
        id: 'q5-8',
        questionText: '橈側皮静脈（親指側の静脈）を狙う際、近くを走行しているため注意が必要な神経は？',
        options: [
          { id: 'a', text: '外側前腕皮神経', isCorrect: true },
          { id: 'b', text: '内側前腕皮神経', isCorrect: false },
          { id: 'c', text: '坐骨神経', isCorrect: false },
          { id: 'd', text: '顔面神経', isCorrect: false },
        ],
        explanation: '橈側皮静脈の近くには外側前腕皮神経が走行しています。特に深部を狙う際は注意が必要です。(書籍 p.62 fig.5-7 参照)',
      },
      {
        id: 'q5-9',
        questionText: '上腕動脈は、肘窩においてどの静脈の近く（深部）を走行していますか？',
        options: [
          { id: 'a', text: '橈側皮静脈の外側', isCorrect: false },
          { id: 'b', text: '手背静脈', isCorrect: false },
          { id: 'c', text: '尺側皮静脈および肘正中皮静脈の内側寄り', isCorrect: true },
          { id: 'd', text: '足背静脈', isCorrect: false },
        ],
        explanation: '上腕動脈は肘窩の内側寄り、尺側皮静脈や正中神経の近くを走行しています。拍動を確認し、誤って穿刺しないよう注意が必要です。(書籍 p.58 fig.5-3 参照)',
      },
      {
        id: 'q5-10',
        questionText: '穿刺中に患者さんが「指先の方に電気が走ったような痛み」を訴えた場合の正しい対応は？',
        options: [
          { id: 'a', text: '「我慢してください」と言って続ける', isCorrect: false },
          { id: 'b', text: '針を少し引いて角度を変える', isCorrect: false },
          { id: 'c', text: '直ちに抜針し、穿刺を中止する', isCorrect: true },
          { id: 'd', text: '駆血帯をきつく締め直す', isCorrect: false },
        ],
        explanation: '放散痛は神経に触れた明確なサインです。そのまま操作を続けると神経損傷を重症化させる恐れがあります。直ちに抜針し、医師に報告します。(書籍 p.58 関連)',
      },
    ],
  },
  {
    id: 'lesson-6',
    title: 'Lesson 6 血管の選択と失敗時の対応（p.67-84）',
    description: '穿刺に適した血管の選び方（Y字分岐など）と、失敗した場合の冷静な対処法、再穿刺時のマナーを学びます。',
    questions: [
      {
        id: 'q6-1',
        questionText: '穿刺しても逆血がない場合、皮下で針先をあちこち探る「探り針」はなぜ推奨されないのですか？',
        options: [
          { id: 'a', text: '時間がかかるから', isCorrect: false },
          { id: 'b', text: '組織や神経を損傷し、強い痛みや後遺症（痺れなど）の原因になるから', isCorrect: true },
          { id: 'c', text: '針が曲がるから', isCorrect: false },
          { id: 'd', text: '患者さんがくすぐったいから', isCorrect: false },
        ],
        explanation: '血管が見つからないからといって、針先を皮下でグリグリと動かすのは非常に危険です。神経損傷のリスクが高く、患者さんに激痛を与えます。一度抜いて仕切り直すのがプロの対応です。(書籍 p.68 参照)',
      },
      {
        id: 'q6-2',
        questionText: '失敗してしまった際、患者さんへの対応として最も適切なのは？',
        options: [
          { id: 'a', text: '「血管が細いですね」と血管のせいにする', isCorrect: false },
          { id: 'b', text: '無言でやり直す', isCorrect: false },
          { id: 'c', text: '「申し訳ありません、痛みがありましたか？」と謝罪し気遣う', isCorrect: true },
          { id: 'd', text: 'すぐに他のスタッフに代わる', isCorrect: false },
        ],
        explanation: '失敗は誰にでもありますが、まずは誠意を持って謝罪し、患者さんの苦痛に配慮することが信頼関係の維持に繋がります。言い訳は避けるべきです。(書籍 p.70 参照)',
      },
      {
        id: 'q6-3',
        questionText: '再穿刺を行う場合、穿刺部位はどこを選ぶべきですか？',
        options: [
          { id: 'a', text: '失敗した部位と同じ場所', isCorrect: false },
          { id: 'b', text: '失敗した部位より中枢側（心臓側）', isCorrect: false },
          { id: 'c', text: '失敗した部位より末梢側、または反対の腕', isCorrect: true },
          { id: 'd', text: 'どこでも良い', isCorrect: false },
        ],
        explanation: '失敗した部位より中枢側で駆血すると、失敗した穴から出血して血腫ができる可能性があります。原則として別の腕にするか、失敗部位より末梢側を選びます。(書籍 p.74 参照)',
      },
      {
        id: 'q6-4',
        questionText: '抜針後の止血について、正しい指導は？',
        options: [
          { id: 'a', text: '「揉んでください」と言う', isCorrect: false },
          { id: 'b', text: '「5分間、揉まずにしっかり押さえていてください」と伝える', isCorrect: true },
          { id: 'c', text: '「そのままでいいです」と言う', isCorrect: false },
          { id: 'd', text: '「軽く触れる程度でいいです」と言う', isCorrect: false },
        ],
        explanation: '揉むと凝固した血液が剥がれ、再出血や内出血の原因になります。揉まずに圧迫止血（5分間）が基本です。(書籍 p.76 参照)',
      },
      {
        id: 'q6-5',
        questionText: '何度か失敗し、自分が「ハマってしまった」と感じた時はどうすべきですか？',
        options: [
          { id: 'a', text: '意地でも成功するまで続ける', isCorrect: false },
          { id: 'b', text: '2回（施設基準による）失敗したら、潔く他のスタッフに交代する', isCorrect: true },
          { id: 'c', text: '休憩してから同じ患者さんに再挑戦する', isCorrect: false },
          { id: 'd', text: 'さらに細い針に変えて粘る', isCorrect: false },
        ],
        explanation: '「2回失敗したら交代」などのルールを設けている施設も多いです。緊張や焦りで視野が狭くなっているため、交代した方が患者さんの負担も少なく、結果的に早く終わります。(書籍 p.80 参照)',
      },
      {
        id: 'q6-6',
        questionText: '血管選択において、血管が「Yの字」に分岐している部分（合流点）が推奨される理由は？',
        options: [
          { id: 'a', text: '見た目がかっこいいから', isCorrect: false },
          { id: 'b', text: '血管が周囲の組織に固定されており、針を刺しても左右に逃げにくいから', isCorrect: true },
          { id: 'c', text: '血管が細くなるから', isCorrect: false },
          { id: 'd', text: '神経がないから', isCorrect: false },
        ],
        explanation: 'Y字の分岐部は血管が組織にアンカー（固定）されている状態に近いので、穿刺時に血管がコロコロと逃げるのを防ぎやすく、成功率が高まります。(書籍 p.74 fig.6-3 参照)',
      },
      {
        id: 'q6-7',
        questionText: '血管を選ぶ際、見た目の太さだけでなく、指で触れて何を確認することが重要ですか？',
        options: [
          { id: 'a', text: '温度', isCorrect: false },
          { id: 'b', text: '色', isCorrect: false },
          { id: 'c', text: '弾力（リバウンド）', isCorrect: true },
          { id: 'd', text: '匂い', isCorrect: false },
        ],
        explanation: '見た目は太くても、硬くて弾力がない血管は脆かったり血栓があったりします。指で軽く押して「プルン」と返ってくる弾力がある血管が良い血管です。(書籍 p.69 参照)',
      },
      {
        id: 'q6-8',
        questionText: '前腕（肘より先）で血管を探す場合、比較的まっすぐで穿刺しやすいとされる血管は？',
        options: [
          { id: 'a', text: '指先の毛細血管', isCorrect: false },
          { id: 'b', text: '前腕の橈側皮静脈や正中皮静脈', isCorrect: true },
          { id: 'c', text: '足の血管', isCorrect: false },
          { id: 'd', text: '脇の下の血管', isCorrect: false },
        ],
        explanation: '前腕の橈側（親指側）や中央を走る静脈は、比較的直線的で固定もしやすく、肘の次に選択肢となることが多い部位です。(書籍 p.69 fig.6-1 参照)',
      },
      {
        id: 'q6-9',
        questionText: '触診した際に「硬い」「コリコリする」と感じる血管は、どのような状態が疑われますか？',
        options: [
          { id: 'a', text: '非常に健康な血管', isCorrect: false },
          { id: 'b', text: '血管が硬化している、または過去の穿刺による瘢痕がある', isCorrect: true },
          { id: 'c', text: '血液が満タンに入っている', isCorrect: false },
          { id: 'd', text: '筋肉である', isCorrect: false },
        ],
        explanation: '硬い血管は針が刺さりにくく、血管壁も傷つきやすいため、穿刺部位としては不向きです。避けるのが無難です。(書籍 p.70 関連)',
      },
      {
        id: 'q6-10',
        questionText: '手背（手の甲）の血管を選択する場合の注意点として正しいものは？',
        options: [
          { id: 'a', text: '痛みが全くない', isCorrect: false },
          { id: 'b', text: '血管が太く固定されているので最も簡単', isCorrect: false },
          { id: 'c', text: '血管が細く動きやすいため固定をしっかり行う必要があり、痛みも比較的強い', isCorrect: true },
          { id: 'd', text: '神経損傷のリスクがない', isCorrect: false },
        ],
        explanation: '手背は皮下脂肪が薄く血管が逃げやすい上、神経も浅い位置にあるため痛みを感じやすい部位です。しっかりとした固定と愛護的な操作が必要です。(書籍 p.75 参照)',
      },
    ],
  },

     {
       id: 'lesson-7',
       title: 'Lesson 7 困難血管へのアプローチと対処法（p.85-98）',
       description: '細い血管、逃げる血管、見えない血管など、困難な状況での採血アプローチと対処法を学びます。',
       questions: [
         {
           id: 'q7-1',
           questionText: '細い血管からの採血で、真空管採血が困難な場合に推奨される方法はどれですか？',
           options: [
             { id: 'a', text: '駆血帯をさらに強く巻く', isCorrect: false },
             { id: 'b', text: '注射器（シリンジ）採血に切り替える', isCorrect: true },
             { id: 'c', text: 'より太いゲージの針を使用する', isCorrect: false },
             { id: 'd', text: '採血部位を強く叩いて血管を怒張させる', isCorrect: false },
           ],
           explanation: '細い血管では、真空管採血の陰圧が強すぎて血管が虚脱したり、針先が血管壁を塞いで血液が出にくくなることがあります。注射器採血であれば、自分で陰圧を調整できるため、細い血管にも対応しやすくなります。(書籍 p.86 参照)',
         },
         {
           id: 'q7-2',
           questionText: '「逃げる血管」への対処法として、著者が推奨する「3点固定」の正しい手順はどれですか？',
           options: [
             { id: 'a', text: '針を持つ手で血管を固定し、もう一方の手で皮膚を引っ張る', isCorrect: false },
             { id: 'b', text: '針を持っていない手でL字を作り、穿刺点を挟んで中指で血管を横方向に引っ張る', isCorrect: true },
             { id: 'c', text: '穿刺点の上下を指で強く押さえつける', isCorrect: false },
             { id: 'd', text: '駆血帯を二重に巻いて血管の動きを止める', isCorrect: false },
           ],
           explanation: '3点固定は、針を持っていない手でL字を作り、穿刺点を間に挟むようにして、中指で血管を横方向に引っ張ることで、血管の逃げを防ぎます。(書籍 p.88 fig.7-2 参照)',
         },
         {
           id: 'q7-3',
           questionText: '深くて見えない血管にアプローチする際の大前提として、最も重要なことは何ですか？',
           options: [
             { id: 'a', text: '血管の走行を予測し、真上から刺入する', isCorrect: true },
             { id: 'b', text: '皮膚を強く引っ張り、血管を浮き上がらせる', isCorrect: false },
             { id: 'c', text: '針を深く刺し、広範囲を探る', isCorrect: false },
             { id: 'd', text: '患者さんに深呼吸を促し、血管を拡張させる', isCorrect: false },
           ],
           explanation: '深くて見えない血管でも、解剖学的知識と触診で血管の走行を予測し、その血管の頂点（真上）をねらって刺入することが成功の鍵です。(書籍 p.91 fig.7-4 参照)',
         },
         {
           id: 'q7-4',
           questionText: '血管が出にくい患者さんへの対処法として、第一選択ともいえる効果的な方法はどれですか？',
           options: [
             { id: 'a', text: '採血部位を強く叩く', isCorrect: false },
             { id: 'b', text: '腕を心臓より下にして下垂させる', isCorrect: true },
             { id: 'c', text: '駆血帯を長時間巻いたままにする', isCorrect: false },
             { id: 'd', text: '冷たいタオルで採血部位を冷やす', isCorrect: false },
           ],
           explanation: '血管が出にくい場合、腕を心臓より下にして下垂させることで、重力により血液が末梢に集まり、血管が怒張しやすくなります。これは第一選択ともいえる効果的な方法です。(書籍 p.96 参照)',
         },
         {
           id: 'q7-5',
           questionText: '細い血管への採血で、針の選択として推奨されるのはどれですか？',
           options: [
             { id: 'a', text: '18Gの直針', isCorrect: false },
             { id: 'b', text: '21Gの直針', isCorrect: false },
             { id: 'c', text: '23Gの翼状針', isCorrect: true },
             { id: 'd', text: '25Gの翼状針', isCorrect: false },
           ],
           explanation: '細い血管には、針が細く、かつ角度を浅く保ちやすい23Gの翼状針が推奨されます。これにより血管の貫通リスクを減らし、成功率を高めます。(書籍 p.87 参照)',
         },
         {
           id: 'q7-6',
           questionText: '「逃げる血管」への「4点固定」は、「3点固定」に加えてどのような固定を行いますか？',
           options: [
             { id: 'a', text: '患者さんの手首を強く握る', isCorrect: false },
             { id: 'b', text: '針を持つ手の中指・薬指等で手前にもテンションをかける', isCorrect: true },
             { id: 'c', text: '駆血帯をさらにきつく締める', isCorrect: false },
             { id: 'd', text: '穿刺部位の皮膚を上下に引っ張る', isCorrect: false },
           ],
           explanation: '4点固定は、3点固定で血管を横方向に引っ張ることに加え、針を持つ手の中指や薬指などで穿刺部位の手前側にもテンションをかけることで、より強固に血管を固定する手技です。(書籍 p.89 fig.7-3 参照)',
         },
         {
           id: 'q7-7',
           questionText: '深くて見えない血管を触知する際の注意点として正しいものはどれですか？',
           options: [
             { id: 'a', text: '指の腹で強く押しつけ、血管の硬さを確認する', isCorrect: false },
             { id: 'b', text: '指の腹を軽く乗せ、少しずつずらして弾力を確認する', isCorrect: true },
             { id: 'c', text: '血管の走行を無視して、広範囲をランダムに触る', isCorrect: false },
             { id: 'd', text: '触知はせず、目視のみで判断する', isCorrect: false },
           ],
           explanation: '深くて見えない血管を触知する際は、指の腹を軽く乗せて、少しずつずらしながら血管の弾力を確認します。強く押しすぎると血管が潰れてしまい、触知しにくくなります。(書籍 p.92 参照)',
         },
         {
           id: 'q7-8',
           questionText: '穿刺者が右利きの場合、穿刺点が決まった後に針捨て容器とアルコール綿を配置する際の推奨される位置はどれですか？',
           options: [
             { id: 'a', text: '針捨て容器を左側、アルコール綿を右側に置く', isCorrect: false },
             { id: 'b', text: '針捨て容器を右側、アルコール綿を左側に置く', isCorrect: true },
             { id: 'c', text: '両方とも患者さんの頭側に置く', isCorrect: false },
             { id: 'd', text: '両方とも患者さんの足側に置く', isCorrect: false },
           ],
           explanation: '右利きの場合、針捨て容器を右側、アルコール綿を左側に置くことで、針とアルコール綿が交差せず、スムーズな手技が可能になります。特に針捨て容器は、抜針後すぐに廃棄できるよう利き手側に置くのが安全です。(書籍 p.93 fig.7-6 参照)',
         },
         {
           id: 'q7-9',
           questionText: '血管が出にくい患者さんへの「クレンチング」の具体的な方法として正しいものはどれですか？',
           options: [
             { id: 'a', text: '採血部位を強く握りしめる', isCorrect: false },
             { id: 'b', text: 'グーパー運動を10回程度繰り返す', isCorrect: true },
             { id: 'c', text: '腕を大きく回す運動を数回行う', isCorrect: false },
             { id: 'd', text: '指を一本ずつゆっくりと曲げ伸ばしする', isCorrect: false },
           ],
           explanation: 'クレンチングとは、患者さんにグーパー運動を10回程度繰り返してもらうことで、筋肉のポンプ作用により血液を末梢に送り込み、血管を怒張させる方法です。(書籍 p.95 参照)',
         },
         {
           id: 'q7-10',
           questionText: '血管が出にくい患者さんへの「保温」の適切な方法と時間はどれですか？',
           options: [
             { id: 'a', text: '冷たいタオルで短時間冷やす', isCorrect: false },
             { id: 'b', text: '熱いタオルで長時間温める', isCorrect: false },
             { id: 'c', text: 'ホットタオル等で40度程度、5〜10分間温める', isCorrect: true },
             { id: 'd', text: '電気毛布で全身を温める', isCorrect: false },
           ],
           explanation: '保温は、ホットタオルなどで採血部位を40度程度で5〜10分間温めるのが効果的です。これにより血管が拡張し、怒張しやすくなります。(書籍 p.96 参照)',
         },
       ],
     },
     {
       id: 'lesson-8',
       title: 'Lesson 8 採血時のトラブル対処法（p.99-110）',
       description: '採血途中で血液が出なくなった場合や、採血後に皮下出血が生じた場合の対処法を学びます。',
       questions: [
         {
           id: 'q8-1',
           questionText: '採血途中で血液が出なくなった場合、まず確認すべき原因として最も可能性が高いものはどれですか？',
           options: [
             { id: 'a', text: '患者さんの体位が不適切である', isCorrect: false },
             { id: 'b', text: '駆血帯が強すぎて動脈まで止めている（虚血）', isCorrect: true },
             { id: 'c', text: '採血スピッツの容量が不足している', isCorrect: false },
             { id: 'd', text: '患者さんが緊張しすぎている', isCorrect: false },
           ],
           explanation: '採血途中で血液が出なくなる原因の一つに、駆血帯が強すぎて動脈まで止めてしまい、静脈への血液供給が途絶える「虚血」があります。手のひらが白くなっている場合はこの可能性が高いです。(書籍 p.100 参照)',
         },
         {
           id: 'q8-2',
           questionText: '採血途中で血液が出なくなった際、針先が血管の上壁に当たっている場合の対処法として正しいものはどれですか？',
           options: [
             { id: 'a', text: '針をさらに深く刺し込む', isCorrect: false },
             { id: 'b', text: '針を少し引くか、角度を少しつける', isCorrect: true },
             { id: 'c', text: '針の向きを左右に大きく変える', isCorrect: false },
             { id: 'd', text: '一度抜針して別の部位に穿刺する', isCorrect: false },
           ],
           explanation: '針先が血管の上壁に当たっている場合は、針を少し引くか、角度を少しつけることで針先が血管内に戻り、血液が流れ出すことがあります。(書籍 p.102 参照)',
         },
         {
           id: 'q8-3',
           questionText: '採血後に皮下出血が生じるのを防ぐために、止血する際に最も重要なポイントはどれですか？',
           options: [
             { id: 'a', text: '皮膚の刺入部だけを軽く押さえる', isCorrect: false },
             { id: 'b', text: '揉むようにして血液を散らす', isCorrect: false },
             { id: 'c', text: '針の刺入部（皮膚）だけでなく、血管の穿刺部も強めに押さえる', isCorrect: true },
             { id: 'd', text: '止血バンドをきつく巻いて放置する', isCorrect: false },
           ],
           explanation: '皮下出血を防ぐためには、針の刺入部（皮膚）だけでなく、血管の穿刺部（皮膚の穴より中枢側にあることが多い）をしっかり押さえることが重要です。血管の穴を塞ぐ意識が必要です。(書籍 p.105 fig.8-4 参照)',
         },
         {
           id: 'q8-4',
           questionText: '採血後の止血において、推奨される圧迫方法と時間はどれですか？',
           options: [
             { id: 'a', text: '軽く揉みながら1分間', isCorrect: false },
             { id: 'b', text: '指3本でしっかり5分間圧迫する', isCorrect: true },
             { id: 'c', text: '指1本で軽く10分間', isCorrect: false },
             { id: 'd', text: '圧迫せず、絆創膏を貼るだけ', isCorrect: false },
           ],
           explanation: '止血は、揉まずに指3本（またはそれ以上の範囲）で、十分な強さで5分間しっかり圧迫することが推奨されます。揉むと内出血が広がる可能性があります。(書籍 p.107 参照)',
         },
         {
           id: 'q8-5',
           questionText: '採血途中で血液が出なくなった原因として、「駆血帯が強すぎる」ことのサインはどれですか？',
           options: [
             { id: 'a', text: '患者さんの顔色が赤くなる', isCorrect: false },
             { id: 'b', text: '手のひらが白くなる', isCorrect: true },
             { id: 'c', text: '採血部位が熱くなる', isCorrect: false },
             { id: 'd', text: '患者さんが痛みを訴える', isCorrect: false },
           ],
           explanation: '駆血帯が強すぎて動脈まで止めてしまうと、末梢への血液供給が途絶え、手のひらが白くなることがあります。これは虚血のサインです。(書籍 p.100 参照)',
         },
         {
           id: 'q8-6',
           questionText: '採血途中で血液が出なくなった際、針先が血管の側壁に当たっている場合の対処法として正しいものはどれですか？',
           options: [
             { id: 'a', text: '針を抜かずに、針の向きを調整する', isCorrect: true },
             { id: 'b', text: '針を深く刺し直す', isCorrect: false },
             { id: 'c', text: '駆血帯を外して再度巻く', isCorrect: false },
             { id: 'd', text: '患者さんに腕を動かしてもらう', isCorrect: false },
           ],
           explanation: '針先が血管の側壁に当たっている場合は、針を抜かずに、針の向きを少し調整することで血管内に針先が入り、血液が流れ出すことがあります。(書籍 p.102 参照)',
         },
         {
           id: 'q8-7',
           questionText: '採血後の皮下出血の原因として、止血場所が不適切であることの具体的な説明はどれですか？',
           options: [
             { id: 'a', text: '皮膚の刺入部と血管の穿刺部が同じ位置にあると誤解している', isCorrect: false },
             { id: 'b', text: '血管の穿刺部が皮膚の刺入部より末梢側にあると誤解している', isCorrect: false },
             { id: 'c', text: '血管の穿刺部が皮膚の刺入部より中枢側にあることが多いのに、皮膚の穴だけを押さえている', isCorrect: true },
             { id: 'd', text: '止血時に患者さんの腕を高く上げすぎている', isCorrect: false },
           ],
           explanation: '血管の穿刺部は、皮膚の刺入部よりも針の刺入角度によって中枢側にずれていることが多いです。皮膚の穴だけを押さえても血管の穴が塞がれず、皮下出血の原因となります。(書籍 p.105 fig.8-4 参照)',
         },
         {
           id: 'q8-8',
           questionText: '「内出血」と「皮下出血」の違いに関する説明として、最も適切なものはどれですか？',
           options: [
             { id: 'a', text: '内出血は皮膚の内側で出血すること全般を指し、皮下出血はその一種で皮下組織に血液が溜まった状態を指す', isCorrect: true },
             { id: 'b', text: '内出血は動脈からの出血、皮下出血は静脈からの出血を指す', isCorrect: false },
             { id: 'c', text: '内出血は痛みを伴い、皮下出血は痛みを伴わない', isCorrect: false },
             { id: 'd', text: '内出血は自然に治るが、皮下出血は治療が必要である', isCorrect: false },
           ],
           explanation: '内出血は広義で皮膚の内側で出血すること全般を指し、皮下出血はその中でも皮下組織に血液が溜まった状態、いわゆる青あざを指します。通常、1〜2週間で自然に治癒します。(書籍 p.106 コラム参照)',
         },
         {
           id: 'q8-9',
           questionText: '採血途中で血液が出なくなった際、翼状針を使用している場合の針先の固定方法として推奨されるのはどれですか？',
           options: [
             { id: 'a', text: '羽をテープで皮膚に完全に固定する', isCorrect: false },
             { id: 'b', text: '羽の下に綿やテープを挟んで針先を安定させる', isCorrect: true },
             { id: 'c', text: '羽を指で強く押さえつける', isCorrect: false },
             { id: 'd', text: '羽を動かして血管を探る', isCorrect: false },
           ],
           explanation: '翼状針の場合、羽の下に綿やテープを挟むことで針先が安定し、血管壁に当たって血液が出なくなるのを防ぐことができます。これにより、針先のぐらつきを抑えられます。(書籍 p.103 fig.8-2 参照)',
         },
         {
           id: 'q8-10',
           questionText: '採血後の止血で「揉まない」ことが重要な理由として正しいものはどれですか？',
           options: [
             { id: 'a', text: '揉むと患者さんが痛がるため', isCorrect: false },
             { id: 'b', text: '揉むことで内出血が広がりやすくなるため', isCorrect: true },
             { id: 'c', text: '揉むと止血効果が薄れるため', isCorrect: false },
             { id: 'd', text: '揉むと感染のリスクが高まるため', isCorrect: false },
           ],
           explanation: '止血時に揉むと、血管の穴から漏れ出た血液が皮下組織に広がりやすくなり、内出血が大きくなる原因となります。そのため、揉まずにしっかり圧迫することが重要です。(書籍 p.107 参照)',
         },
       ],
     },
  {
    id: 'lesson-9',
    title: 'Lesson 9 正確な血液検査のために（p.111-136）',
    description: '採血スピッツの順序、抗凝固剤の役割、溶血の原因と対策など、検査値に直結する知識を学びます。',
    questions: [
      {
        id: 'q9-1',
        questionText: '複数の採血スピッツに分注する場合、一般的に推奨される「採血順序（真空管採血）」はどれですか？',
        options: [
          { id: 'a', text: '血算 → 血糖 → 生化学 → 凝固', isCorrect: false },
          { id: 'b', text: '生化学 → 凝固 → 血算 → 血糖', isCorrect: true },
          { id: 'c', text: '凝固 → 血算 → 生化学 → 血糖', isCorrect: false },
          { id: 'd', text: 'どの順番でも変わらない', isCorrect: false },
        ],
        explanation: '凝固系への組織液混入を防ぐため、生化学（凝固促進剤入り）を先に採り、次に凝固、その後に抗凝固剤入りの血算・血糖などを採るのが一般的です。著者の覚え方は「生化学（ぎょうさん採れる）→凝固→血算→血糖」です。(書籍 p.113 参照)',
      },
      {
        id: 'q9-2',
        questionText: '血算（CBC）用の採血スピッツに含まれている抗凝固剤「EDTA」の作用機序は？',
        options: [
          { id: 'a', text: 'フィブリノゲンを分解する', isCorrect: false },
          { id: 'b', text: 'カルシウムイオンをキレート除去（結合）する', isCorrect: true },
          { id: 'c', text: '血小板を破壊する', isCorrect: false },
          { id: 'd', text: '血液を冷却する', isCorrect: false },
        ],
        explanation: 'EDTA（エチレンジアミン四酢酸）は、血液凝固に必要なカルシウムイオンと強力に結合（キレート）することで、凝固カスケードを遮断し、血液をサラサラの状態に保ちます。(書籍 p.114 参照)',
      },
      {
        id: 'q9-3',
        questionText: '凝固検査用（クエン酸ナトリウム入り）の採血において、特に注意すべき点は何ですか？',
        options: [
          { id: 'a', text: 'スピッツを激しく振る', isCorrect: false },
          { id: 'b', text: '血液と抗凝固剤の混合比（9:1）を正確にするため、規定量ラインまできっちり採血する', isCorrect: true },
          { id: 'c', text: 'できるだけ少量で済ませる', isCorrect: false },
          { id: 'd', text: '採血後、冷蔵庫で保管する', isCorrect: false },
        ],
        explanation: '凝固検査は血液とクエン酸ナトリウムの比率（9:1）が正確でないと検査値に大きな影響が出るため、必ず規定のラインまで採血する必要があります。(書籍 p.115 参照)',
      },
      {
        id: 'q9-4',
        questionText: '血糖検査用のスピッツに含まれる「フッ化ナトリウム」の主な役割は？',
        options: [
          { id: 'a', text: '血液の色を鮮やかにする', isCorrect: false },
          { id: 'b', text: '赤血球によるブドウ糖の消費（解糖）を阻止し、血糖値の低下を防ぐ', isCorrect: true },
          { id: 'c', text: '血液を凝固させる', isCorrect: false },
          { id: 'd', text: '白血球を増やす', isCorrect: false },
        ],
        explanation: '採血後も赤血球はブドウ糖を消費（解糖）し続けるため、そのままでは血糖値が下がってしまいます。フッ化ナトリウムは解糖系酵素エノラーゼを阻害し、血糖値を安定させます。(書籍 p.116 参照)',
      },
      {
        id: 'q9-5',
        questionText: '採血後の「転倒混和」の正しい方法は？',
        options: [
          { id: 'a', text: '激しくシェイクする', isCorrect: false },
          { id: 'b', text: 'スピッツを横にして転がす', isCorrect: false },
          { id: 'c', text: 'ゆっくりと180度回転させる動作を5〜10回程度行う', isCorrect: true },
          { id: 'd', text: '1回だけ逆さにする', isCorrect: false },
        ],
        explanation: '激しく振ると溶血の原因になります。薬剤と血液を均一に混ぜるため、気泡が移動するくらいの速さでゆっくりと180度回転（転倒混和）を5回以上（EDTA等は10回程度）行います。(書籍 p.122-123 参照)',
      },
      {
        id: 'q9-6',
        questionText: '「溶血」が起きた検体（血清）はどのような色になりますか？',
        options: [
          { id: 'a', text: '透明（無色）', isCorrect: false },
          { id: 'b', text: '黄色っぽい色', isCorrect: false },
          { id: 'c', text: '赤色（赤ワイン色）', isCorrect: true },
          { id: 'd', text: '白濁色', isCorrect: false },
        ],
        explanation: '通常、血清は黄色っぽい色をしていますが、溶血（赤血球が壊れる）すると、赤血球内のヘモグロビン（赤色）が血清中に漏れ出し、赤く染まります。(書籍 p.128 fig.9-4 参照)',
      },
      {
        id: 'q9-7',
        questionText: '溶血によって偽高値（実際より高く出る）となる検査項目として代表的なものは？',
        options: [
          { id: 'a', text: 'ナトリウム (Na)', isCorrect: false },
          { id: 'b', text: 'カリウム (K)', isCorrect: true },
          { id: 'c', text: 'クロール (Cl)', isCorrect: false },
          { id: 'd', text: '血糖値 (Glu)', isCorrect: false },
        ],
        explanation: '赤血球内にはカリウムが高濃度で含まれているため、溶血して赤血球が壊れるとカリウムが血清中に流出し、検査値が見かけ上高くなります（偽高値）。(書籍 p.130 参照)',
      },
      {
        id: 'q9-8',
        questionText: '注射器採血後、分注する際に「やってはいけない」操作は？',
        options: [
          { id: 'a', text: '血液分注器を使用する', isCorrect: false },
          { id: 'b', text: '採血スピッツを立てて固定する', isCorrect: false },
          { id: 'c', text: '採血スピッツのゴム栓に針を刺して、内筒を強く押して注入する', isCorrect: true },
          { id: 'd', text: 'スピッツの壁面に沿わせてゆっくり注入する（蓋を開けるタイプの場合）', isCorrect: false },
        ],
        explanation: '針を刺して内筒を強く押すと、血液が強い圧力で噴出し、細胞が破壊されて溶血の原因になります。また、針刺し事故のリスクも高まります。陰圧を利用して自然に吸い込ませるか、蓋を開けて壁面を伝わせます。(書籍 p.132 参照)',
      },
      {
        id: 'q9-9',
        questionText: '翼状針を使用して真空管採血を行う際、最初に留意すべきことは？',
        options: [
          { id: 'a', text: 'チューブ内の空気（デッドスペース）の分だけ採血量が不足する可能性がある', isCorrect: true },
          { id: 'b', text: '翼状針は溶血しやすい', isCorrect: false },
          { id: 'c', text: '翼状針では凝固検査はできない', isCorrect: false },
          { id: 'd', text: 'チューブを結んでから採血する', isCorrect: false },
        ],
        explanation: '翼状針のチューブ内には約0.45mLの空気が入っています。凝固検査など厳密な採血量が必要な場合、最初のスピッツに空気が入って規定量不足になるのを防ぐため、ダミーのスピッツでエアーを抜く必要があります。(書籍 p.119 参照)',
      },
      {
        id: 'q9-10',
        questionText: '「クレンチング（グーパー運動）」に関する注意点として正しいものは？',
        options: [
          { id: 'a', text: '採血中もずっと続けてもらう', isCorrect: false },
          { id: 'b', text: '採血直前に激しく行うと、カリウム値が上昇する恐れがある', isCorrect: true },
          { id: 'c', text: '採血には全く影響しない', isCorrect: false },
          { id: 'd', text: '駆血帯を外してから行う', isCorrect: false },
        ],
        explanation: 'クレンチング（筋肉の収縮）を行うと、筋肉細胞からカリウムが流出し、局所的にカリウム値が上昇することがあります。採血直前の激しいグーパーは避けるか、静脈が怒張したら止めてもらうようにします。(書籍 p.133 参照)',
      },
    ],
  },
  {
    id: 'lesson-10',
    title: 'Lesson 10 静脈ルート確保の基本（p.137-148）',
    description: '静脈留置針の構造（内針と外針のギャップ）や、ルート確保の4ステップについて学びます。',
    questions: [
      {
        id: 'q10-1',
        questionText: '静脈留置針の構造において、「内針（金属針）」と「外針（カテーテル）」の長さの関係は？',
        options: [
          { id: 'a', text: '外針の方が長い', isCorrect: false },
          { id: 'b', text: '内針と外針は全く同じ長さ', isCorrect: false },
          { id: 'c', text: '内針の方が少し長く、先端から飛び出している', isCorrect: true },
          { id: 'd', text: 'メーカーによってバラバラで決まりはない', isCorrect: false },
        ],
        explanation: '皮膚を穿刺するために、鋭利な内針（金属）が外針（カテーテル）よりも少し長く作られており、先端から数ミリ飛び出しています。この「ギャップ」を理解することが重要です。(書籍 p.145 参照)',
      },
      {
        id: 'q10-2',
        questionText: '留置針のゲージ（G）数が「小さい」ほど、内針と外針の長さのギャップはどうなりますか？',
        options: [
          { id: 'a', text: 'ギャップは大きくなる（飛び出しが長くなる）', isCorrect: true },
          { id: 'b', text: 'ギャップは小さくなる（飛び出しが短くなる）', isCorrect: false },
          { id: 'c', text: 'ギャップは変わらない', isCorrect: false },
          { id: 'd', text: 'ギャップはなくなる', isCorrect: false },
        ],
        explanation: '針が太く（ゲージ数が小さく）なるほど、組織抵抗に負けないよう内針の飛び出し（ギャップ）も長くなります。例えば24Gで約1.2mmに対し、18Gでは約3.0mmものギャップがあります。(書籍 p.145 コラム参照)',
      },
      {
        id: 'q10-3',
        questionText: '静脈ルート確保の4ステップの正しい順序は？',
        options: [
          { id: 'a', text: '刺す → 進める → 寝かせる → 抜く', isCorrect: false },
          { id: 'b', text: '刺す → 寝かせる → 数ミリ進める → 外針のみ進める', isCorrect: true },
          { id: 'c', text: '刺す → 外針のみ進める → 寝かせる → 数ミリ進める', isCorrect: false },
          { id: 'd', text: '寝かせる → 刺す → 進める → 固定する', isCorrect: false },
        ],
        explanation: '①血管に刺す → ②逆血が来たら針を寝かせる → ③ギャップを埋めるため内針ごと数ミリ進める → ④内針を固定し、外針のみを血管内に進める、という手順が基本です。(書籍 p.148 参照)',
      },
      {
        id: 'q10-4',
        questionText: '逆血（バックフロー）を確認するための正しい目線（確認ポイント）はどこですか？',
        options: [
          { id: 'a', text: '針の先端', isCorrect: false },
          { id: 'b', text: '皮膚の刺入部', isCorrect: false },
          { id: 'c', text: '内針基（ハブ）の透明な部分', isCorrect: true },
          { id: 'd', text: '患者さんの顔', isCorrect: false },
        ],
        explanation: '内針が血管に入ると、血液が内針を通って手元の「内針基（ハブ）」に返ってきます。ここを見ることで、針先が血管内に入ったことを確認できます。(書籍 p.141 参照)',
      },
      {
        id: 'q10-5',
        questionText: '逆血確認後、針を寝かせてから「数ミリ進める」操作が必要な理由は？',
        options: [
          { id: 'a', text: '痛みを減らすため', isCorrect: false },
          { id: 'b', text: '内針しか血管に入っていない状態から、外針（カテーテル）まで血管内に入れるため', isCorrect: true },
          { id: 'c', text: '逆血を止めるため', isCorrect: false },
          { id: 'd', text: '内針を折るため', isCorrect: false },
        ],
        explanation: '逆血が来た瞬間は、突き出ている「内針」だけが血管に入っており、「外針」はまだ血管外にある可能性があります。ギャップ分を進めて外針の先端まで血管内に入れる必要があります。(書籍 p.144 fig.10-8 参照)',
      },
      {
        id: 'q10-6',
        questionText: '外針を血管内に進める際（ステップ4）、内針をどうするべきですか？',
        options: [
          { id: 'a', text: '内針も一緒に奥まで押し込む', isCorrect: false },
          { id: 'b', text: '内針を前後に出し入れする', isCorrect: false },
          { id: 'c', text: '内針は動かさず固定し（または少し引き）、外針のみをスライドさせて進める', isCorrect: true },
          { id: 'd', text: '内針を回転させる', isCorrect: false },
        ],
        explanation: '内針をそのまま進めると血管壁を突き破る恐れがあります。内針はガイド役として固定し、柔らかい外針だけを血管の走行に沿って進めます。(書籍 p.146 参照)',
      },
      {
        id: 'q10-7',
        questionText: '逆血が確認しやすい、著者が推奨する留置針の持ち方は？',
        options: [
          { id: 'a', text: '親指と人差指で全体を覆うように持つ', isCorrect: false },
          { id: 'b', text: '示指を針の上に置いて、上から押さえる', isCorrect: false },
          { id: 'c', text: '示指を上から横に少しずらし、内針基（ハブ）が見えるように持つ', isCorrect: true },
          { id: 'd', text: '小指だけで持つ', isCorrect: false },
        ],
        explanation: '示指を針の真上に置くとハブが見えなくなります。少し横にずらして持つことで、逆血が来た瞬間に視認でき、適切なタイミングで次の動作に移れます。(書籍 p.142 fig.10-5 参照)',
      },
      {
        id: 'q10-8',
        questionText: '穿刺のステップ1「刺す」ときの推奨角度は？',
        options: [
          { id: 'a', text: '約 5〜10度', isCorrect: false },
          { id: 'b', text: '約 15〜30度（深さによる）', isCorrect: true },
          { id: 'c', text: '約 45度以上', isCorrect: false },
          { id: 'd', text: '90度（直角）', isCorrect: false },
        ],
        explanation: '浅い血管なら15〜20度、深めの血管なら約30度で刺入します。血管の深さに応じて調整しますが、あまり角度をつけすぎると貫通リスクが高まります。(書籍 p.141 参照)',
      },
      {
        id: 'q10-9',
        questionText: '留置針操作の練習に有効な身近なアイテムとして挙げられているものは？',
        options: [
          { id: 'a', text: '消しゴム', isCorrect: false },
          { id: 'b', text: 'ストローや点滴チューブ', isCorrect: true },
          { id: 'c', text: '紙コップ', isCorrect: false },
          { id: 'd', text: 'ボールペン', isCorrect: false },
        ],
        explanation: '透明な点滴チューブやストローを血管に見立てて、内針の先端が中に入ってから外針を進めるイメージトレーニングを行うと効果的です。(書籍 p.147 参照)',
      },
      {
        id: 'q10-10',
        questionText: '外針をすべて進めた後、駆血帯を外すタイミングは？',
        options: [
          { id: 'a', text: '内針を抜く前', isCorrect: true },
          { id: 'b', text: '内針を抜いた後', isCorrect: false },
          { id: 'c', text: '点滴をつないだ後', isCorrect: false },
          { id: 'd', text: '固定が終わってから', isCorrect: false },
        ],
        explanation: '内針を抜く前に駆血帯を外して血管内圧を下げておきます。駆血したまま内針を抜くと、血液が逆流して漏れ出てくる（血液曝露）リスクがあります。(※一般的手順として。書籍内では詳細な記述は省略されていますが、標準的な手技として)',
      },
    ],
  },
  {
    id: 'lesson-11',
    title: 'Lesson 11 静脈ルート確保時の困難血管へのアプローチとトラブル対処法（p.149-163）',
    description: '浮腫、蛇行血管、点滴漏れ、ライン内のエアー混入など、現場で直面するトラブルへの対処法を学びます。',
    questions: [
      {
        id: 'q11-1',
        questionText: '浮腫がある血管を探す際のコツとして正しいものは？',
        options: [
          { id: 'a', text: '駆血帯をきつく巻いて長時間放置する', isCorrect: false },
          { id: 'b', text: '指の腹を使って広範囲を圧迫し、浮腫をへこませて血管に触れる', isCorrect: true },
          { id: 'c', text: '針で探りながら進める', isCorrect: false },
          { id: 'd', text: '浮腫がある場所は絶対に避ける', isCorrect: false },
        ],
        explanation: '浮腫（むくみ）がある場合、指で持続的に圧迫すると水分が移動して一時的にへこみ（圧痕）、深部にある血管を触知しやすくなります。(書籍 p.152 fig.11-1 参照)',
      },
      {
        id: 'q11-2',
        questionText: '蛇行している血管に留置針を刺入する際のアプローチ法は？',
        options: [
          { id: 'a', text: '蛇行に合わせて針を曲げながら進める', isCorrect: false },
          { id: 'b', text: 'なるべく直線的な部分を選び、終着点（カテーテル先端位置）を予測して手前から刺入する', isCorrect: true },
          { id: 'c', text: 'カーブの頂点に垂直に刺す', isCorrect: false },
          { id: 'd', text: '蛇行血管は絶対に穿刺してはいけない', isCorrect: false },
        ],
        explanation: '蛇行血管でも直線に近い部分を選びます。カテーテルの長さを考慮し、留置後に先端が血管壁に当たらないよう、手前から刺入して直線区間に収めるのがコツです。(書籍 p.157 fig.11-3 参照)',
      },
      {
        id: 'q11-3',
        questionText: '「逃げる血管」に対して、確実に穿刺するためのイメージ（コツ）は？',
        options: [
          { id: 'a', text: 'ゆっくりと慎重に触れるように刺す', isCorrect: false },
          { id: 'b', text: 'ウインナーに串を刺すように、ある程度勢いをつけてスパッと刺す', isCorrect: true },
          { id: 'c', text: '血管の横からこっそり刺す', isCorrect: false },
          { id: 'd', text: '針を回転させながらねじ込む', isCorrect: false },
        ],
        explanation: '血管が硬くて逃げやすい場合、ゆっくり刺すと血管が転がってしまいます。固定をしっかりした上で、ある程度のスピードで表皮と血管壁を一気に貫くイメージが有効です。(書籍 p.154 参照)',
      },
      {
        id: 'q11-4',
        questionText: '点滴ライン（延長チューブ等）にエアーが入ってしまった場合の対処法として、三方活栓を使う方法は？',
        options: [
          { id: 'a', text: '三方活栓を患者側に開放し、エアーを血管内に流す', isCorrect: false },
          { id: 'b', text: '三方活栓の側管（使っていない口）を開け、シリンジ等でエアーを吸い出す', isCorrect: true },
          { id: 'c', text: '三方活栓を分解する', isCorrect: false },
          { id: 'd', text: '三方活栓を叩き割る', isCorrect: false },
        ],
        explanation: '三方活栓がある場合、側管を利用してエアーを抜くのが最も確実です。シリンジで吸引するか、点滴液を少し流してエアーを追い出します。(書籍 p.159 fig.11-6 参照)',
      },
      {
        id: 'q11-5',
        questionText: '点滴ラインに少量の気泡が付着している場合、「弾いて逃がす」コツは？',
        options: [
          { id: 'a', text: 'ラインをたるませて、優しく撫でる', isCorrect: false },
          { id: 'b', text: 'ラインをピンと張り、指で強めに弾いて振動を与え、気泡を浮上させる', isCorrect: true },
          { id: 'c', text: 'ラインを折り曲げる', isCorrect: false },
          { id: 'd', text: 'ラインを温める', isCorrect: false },
        ],
        explanation: 'チューブをピンと引っ張ってテンションをかけた状態で弾く（デコピンする）と、振動が伝わりやすく、気泡が壁面から剥がれて浮上しやすくなります。(書籍 p.161 参照)',
      },
      {
        id: 'q11-6',
        questionText: '血管確保後、点滴が漏れていないかを確認するポイントに含まれないものは？',
        options: [
          { id: 'a', text: '刺入部の腫脹（腫れ）', isCorrect: false },
          { id: 'b', text: '患者さんの疼痛の訴え', isCorrect: false },
          { id: 'c', text: '点滴の滴下速度（落ちが悪くなっていないか）', isCorrect: false },
          { id: 'd', text: '患者さんの食欲', isCorrect: true },
        ],
        explanation: '点滴漏れのサインは、刺入部の腫れ、痛み、滴下不良（落ちない）、逆血がない、などです。食欲は直接関係ありません。(書籍 p.153 参照)',
      },
      {
        id: 'q11-7',
        questionText: '認知症などで情報が得られない患者さんの「漏れやすい血管」を予測する手がかりは？',
        options: [
          { id: 'a', text: '患者さんの星座', isCorrect: false },
          { id: 'b', text: '以前担当した同僚からの情報や、過去のカルテ記録', isCorrect: true },
          { id: 'c', text: '手相を見る', isCorrect: false },
          { id: 'd', text: '直感で判断する', isCorrect: false },
        ],
        explanation: '本人から情報が得られない場合、過去の記録や他のスタッフからの情報収集が重要です。「前回ここで漏れた」「右腕は入りにくい」などの情報は貴重な手がかりになります。(書籍 p.153 参照)',
      },
      {
        id: 'q11-8',
        questionText: '留置針で血管を探る（血管内での針先の操作）ことについて、正しい態度は？',
        options: [
          { id: 'a', text: '何度でも納得いくまで探るべき', isCorrect: false },
          { id: 'b', text: '針先で血管を探る行為は組織損傷のリスクが高いため、最小限に留めるか、潔く諦めて刺し直す', isCorrect: true },
          { id: 'c', text: '針を回転させて周囲を切り開く', isCorrect: false },
          { id: 'd', text: '痛みを伴わないので問題ない', isCorrect: false },
        ],
        explanation: '皮下で針先を動かして血管を探る行為は、痛みや神経・組織損傷の原因になります。見当がつかない場合は無理に探らず、一度抜いて仕切り直すのが安全です。(書籍 p.156 関連)',
      },
      {
        id: 'q11-9',
        questionText: '点滴ラインに大量のエアーが入ってしまった場合のリスクは？',
        options: [
          { id: 'a', text: '血液が綺麗になる', isCorrect: false },
          { id: 'b', text: '肺塞栓（空気塞栓）を引き起こす可能性がある', isCorrect: true },
          { id: 'c', text: '患者さんの体温が上がる', isCorrect: false },
          { id: 'd', text: '点滴の効き目が良くなる', isCorrect: false },
        ],
        explanation: '微量のエアーなら吸収されますが、大量のエアーが血管内に入ると、右心室から肺動脈へ流れ込み、肺塞栓（空気塞栓）を起こして呼吸困難やショック状態になる危険性があります。(書籍 p.158 参照)',
      },
      {
        id: 'q11-10',
        questionText: '高齢者などで血管壁が脆い場合の穿刺の注意点は？',
        options: [
          { id: 'a', text: '太い針で一気に刺す', isCorrect: false },
          { id: 'b', text: '駆血帯を限界まできつく締める', isCorrect: false },
          { id: 'c', text: '細めの針を選び、ゆっくり慎重に外針を進める', isCorrect: true },
          { id: 'd', text: '血管を叩いて刺激する', isCorrect: false },
        ],
        explanation: '脆い血管は破れやすいため、細い針（22Gや24G）を選択し、愛護的に操作します。外針を進める際も、抵抗がないか確認しながらゆっくり進めます。(書籍 p.154 参照)',
      },
    ],
  },
];

// Alias exports for QuizApp.tsx compatibility
export const quizLessons = (() => {
  // NOTE: 取り込み/編集の過程で重複IDが混入してもUIが壊れないように、idで重複排除して公開します。
  const seen = new Set<string>();
  return quizData.filter((lesson) => {
    if (seen.has(lesson.id)) return false;
    seen.add(lesson.id);
    return true;
  });
})();
export const QUIZ_BOOK_TITLE = 'ハヤピンpresents 採血・静脈ルート確保';

/*
  Backup of old Lesson 2 (actually Lesson 6 content):
  {
    id: 'lesson-2-old',
    title: 'Lesson 2 血管選びの極意（Old Version）',
    questions: [
      { id: 'q2-1', ... }, // 3つのSの話など
      { id: 'q2-2', questionText: '血管を怒張させる...タッピング', ... },
      { id: 'q2-3', questionText: '見えない血管...触診', ... },
      { id: 'q2-4', questionText: '高齢者の血管...逃げやすい', ... },
      { id: 'q2-5', questionText: '避けるべき場所...シャント肢', ... },
      { id: 'q2-6', questionText: '安定した姿勢...', ... }, // これは新L2でも採用
      { id: 'q2-7', questionText: 'ラテックスアレルギー...', ... },
      { id: 'q2-8', questionText: '合流して太くなっている血管...', ... },
      { id: 'q2-9', questionText: 'ホットパック...低温火傷', ... },
      { id: 'q2-10', questionText: '駆血圧...', ... } // これは新L2でも採用
    ]
  }
*/
