import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';

interface HelpLesson {
  number: string;
  title: string;
  summary: string;
  paragraphs: readonly string[];
  formulas?: readonly string[];
  exercise?: string;
  sources?: readonly { label: string; url: string }[];
}

interface HelpModule {
  id: string;
  level: string;
  title: string;
  lessons: readonly HelpLesson[];
}

const HELP_MODULES: readonly HelpModule[] = [
  {
    id: 'fundamentos', level: '01 · Básico', title: 'Fundamentos do motor',
    lessons: [
      {
        number: '01', title: 'Como um motor gera movimento',
        summary: 'Do ar e do combustível ao torque no virabrequim.',
        paragraphs: [
          'Num motor a pistão com ignição por centelha, a combustão aquece os gases e eleva a pressão no cilindro. Na expansão, os gases empurram o pistão. A biela transmite a força ao virabrequim, que transforma o movimento de sobe e desce em rotação.',
          'O ponto morto superior (PMS) é o ponto mais alto do curso do pistão. O ponto morto inferior (PMI) é o mais baixo. A cilindrada total é o volume deslocado pelos pistões entre esses pontos, somado para todos os cilindros. Um motor de 2,0 L com quatro cilindros iguais desloca cerca de 500 cm³ por cilindro.',
          'A taxa de compressão compara o volume do cilindro no PMI com o volume que sobra no PMS. Uma taxa de 10:1 indica que o primeiro volume é dez vezes o segundo. A taxa geométrica e a pressão medida no cilindro são grandezas diferentes.'
        ],
        formulas: [
          'Cilindrada por cilindro = π × diâmetro² × curso / 4',
          'Taxa de compressão = (volume deslocado + volume no PMS) / volume no PMS'
        ],
        sources: [{ label: 'NASA · Motor de quatro tempos', url: 'https://www.grc.nasa.gov/www/k-12/BGP/ottoa.html' }]
      },
      {
        number: '02', title: 'Os quatro tempos e o ciclo Otto',
        summary: 'Admissão, compressão, expansão e escape em duas voltas.',
        paragraphs: [
          '1. Admissão. O pistão desce com a admissão aberta. Entra ar, acompanhado de combustível conforme o sistema de injeção.',
          '2. Compressão. O pistão sobe e comprime a carga com as válvulas fechadas na maior parte do curso. A vela inicia a combustão perto do fim da compressão.',
          '3. Expansão. A pressão dos gases empurra o pistão para baixo e produz trabalho útil no virabrequim.',
          '4. Escape. O pistão sobe com a válvula de escape aberta e expulsa os gases queimados.',
          'O ciclo Otto ideal representa a compressão e a expansão sem troca de calor e a adição de calor a volume constante. Um motor real queima ao longo de um intervalo de ângulo, troca calor com as paredes e tem perdas. O MAPA usa um modelo simplificado de torque, sem calcular a pressão em cada grau do ciclo.'
        ],
        formulas: [
          '1 ciclo de quatro tempos = 720° de virabrequim = 2 voltas',
          'Eficiência térmica ideal de Otto = 1 − 1 / taxa_de_compressão^(γ − 1), com γ = Cp / Cv'
        ],
        sources: [{ label: 'NASA · Análise termodinâmica do ciclo Otto', url: 'https://www.grc.nasa.gov/www/k-12/BGP/ottoa.html' }]
      },
      {
        number: '03', title: 'Rotação e carga do motor',
        summary: 'Entenda por que a mesma rotação pode exigir ajustes diferentes.',
        paragraphs: [
          'RPM significa rotações por minuto e indica a velocidade do virabrequim. A 3.000 RPM, são 50 voltas por segundo e, num motor de quatro tempos, 25 ciclos por segundo em cada cilindro.',
          'Carga descreve quanto se exige do motor naquele ponto. Manter a velocidade no plano e acelerar numa subida podem ocorrer ao mesmo RPM, com cargas diferentes. A forma de estimar carga depende da ECU. Ela pode usar pressão absoluta no coletor (MAP), posição da borboleta (TPS) ou outra estratégia.',
          'A carga do MAPA é um eixo didático em porcentagem. Escolha a linha pela carga e a coluna pelo RPM. A puxada atual usa o primeiro ponto de carga da grade, que nos mapas padrão é 100%.'
        ],
        formulas: ['Voltas por segundo = RPM / 60', 'Ciclos por segundo por cilindro em quatro tempos = RPM / 120'],
        sources: [{ label: 'Haltech · Pressão absoluta no coletor', url: 'https://support.haltech.com/portal/en/kb/articles/manifold-pressure' }]
      },
      {
        number: '04', title: 'Eficiência volumétrica, AFR e lambda',
        summary: 'Separe o enchimento do cilindro da proporção entre ar e combustível.',
        paragraphs: [
          'A eficiência volumétrica (VE) compara a massa de ar admitida com uma massa de referência para a cilindrada. A pressão e a temperatura usadas nessa referência importam. Em uma estratégia speed-density, a ECU pode considerar a pressão do coletor separadamente, e a VE descreve o aproveitamento do ar disponível.',
          'AFR é a razão entre a massa de ar e a massa de combustível. Lambda compara esse AFR ao estequiométrico do combustível usado. Abaixo de 1, a mistura é rica. Acima de 1, é pobre. O MAPA usa 14,7:1 como referência fixa de seu modelo, enquanto a referência real varia com o combustível.',
          'No MAPA, a VE editável funciona como ajuste da dosagem. Para a mesma massa de ar estimada, aumentar o valor da célula reduz o AFR. A faixa de edição é 10–100% para aspirados e 10–150% para turbo ou supercharger. Esses valores são limites do simulador.'
        ],
        formulas: ['VE (%) = 100 × massa de ar admitida / massa de referência', 'AFR = massa de ar / massa de combustível', 'λ = AFR medido / AFR estequiométrico do combustível'],
        sources: [
          { label: 'Haltech · Tabelas base e referência de VE', url: 'https://support.haltech.com/portal/en/kb/articles/tuning-base-tables' },
          { label: 'Haltech · Alvo de lambda', url: 'https://support.haltech.com/portal/en/kb/articles/target-lambda' }
        ]
      },
      {
        number: '05', title: 'Avanço de ignição e seus efeitos',
        summary: 'Descubra o que significa acender a centelha 20° antes do PMS.',
        paragraphs: [
          'A chama leva tempo para se propagar. O avanço indica quantos graus o virabrequim ainda tem de girar até o PMS de compressão quando a centelha dispara. Com 20° de avanço, a vela dispara 20° antes desse ponto.',
          'Uma centelha muito atrasada deixa menos expansão útil. Antecipar a centelha pode melhorar o torque até certo ponto. Avanço excessivo pode reduzir o torque, aumentar o esforço antes do PMS ou favorecer detonação. Detonação envolve a autoignição de parte da mistura após o início normal da combustão.',
          'MBT é o menor avanço que produz o melhor torque em determinada condição. Um motor real pode encontrar o limite de detonação antes de atingir o MBT. O MAPA representa os dois limites com fórmulas simplificadas.'
        ],
        formulas: ['Tempo até o PMS (ms) = avanço (°) × 1.000 / (6 × RPM)', 'Exemplo teórico: 20° a 3.000 RPM correspondem a cerca de 1,11 ms'],
        sources: [{ label: 'Haltech · Ângulo base de ignição', url: 'https://support.haltech.com/portal/en/kb/articles/ignition-base' }]
      }
    ]
  },
  {
    id: 'calibracao', level: '02 · Intermediário', title: 'Calibração dos mapas',
    lessons: [
      {
        number: '06', title: 'Como ler uma tabela da ECU',
        summary: 'Encontre o ponto de operação antes de editar a célula.',
        paragraphs: [
          'A ECU lê sensores e usa mapas como tabelas de consulta. Cada combinação de carga e RPM aponta para um valor base. No MAPA, a carga identifica a linha e o RPM identifica a coluna. A interseção contém graus de avanço na ignição ou VE em porcentagem no combustível.',
          'A grade tem seis cargas (100, 85, 70, 55, 40 e 25%) e usa as colunas de mil em mil RPM até 8.000 que estiverem abaixo do corte. A última coluna é o corte exato do motor. Você pode editar em passos inteiros. Pontos entre as células são calculados por interpolação.',
          'Os mapas padrão são compartilhados por classe de cilindrada e tipo. A classe mais próxima determina o mapa base, enquanto o cálculo do dinamômetro usa a cilindrada do motor. A edição é salva para o seu usuário e motor. Use Restaurar mapa de fábrica para remover os ajustes do mapa selecionado.'
        ],
        exercise: 'Na Calibração, localize 85% de carga e 3.000 RPM nos dois mapas. Compare o significado dos dois valores e depois encontre o ponto equivalente na linha de 100%, usada na puxada padrão.',
        sources: [{ label: 'Haltech · Como uma ECU usa tabelas', url: 'https://support.haltech.com/portal/en/kb/articles/how-ecus-work' }]
      },
      {
        number: '07', title: 'Como calibrar o mapa de combustível',
        summary: 'Faça uma referência, ajuste a mistura e compare as curvas.',
        paragraphs: [
          'Numa ECU com VE modelada, a pressão, a temperatura e a VE ajudam a estimar a massa de ar. O alvo de lambda define a mistura desejada. A ECU calcula a dose de combustível com os dados dos injetores. A calibração compara a leitura de uma sonda de banda larga com o alvo no ponto de operação.',
          'No MAPA, comece pelo mapa de referência, mantenha o avanço fixo e faça uma puxada. Observe o AFR por RPM e o estado final. Identifique a faixa que quer estudar e faça uma alteração pequena na linha de plena carga. Aumentar a VE enriquece a mistura. Diminuir a VE empobrece a mistura.',
          'Repita a puxada e compare o AFR na mesma faixa. Acompanhe as células vizinhas, pois a interpolação espalha o efeito entre os pontos da grade. Use os valores desta aula como exemplos do simulador. A mistura adequada de um motor real depende do combustível, da carga e do conjunto.'
        ],
        exercise: 'No simulador, suba uma célula da linha de 100% de 70 para 75, mantendo o avanço fixo. Compare a curva de AFR antes e depois. Se a primeira puxada parar cedo, compare apenas a faixa de RPM que as duas alcançaram.',
        sources: [
          { label: 'Haltech · Calibração de combustível', url: 'https://support.haltech.com/portal/en/kb/articles/tuning-base-tables' },
          { label: 'Link ECU · Modelos de combustível', url: 'https://support.linkecu.com/learn/latest/get-started/getting-running/fuel-equations' }
        ]
      },
      {
        number: '08', title: 'Como calibrar o mapa de ignição',
        summary: 'Compare torque e integridade enquanto varia o avanço.',
        paragraphs: [
          'Em bancada real, a referência de ignição é conferida com uma pistola de ponto. O dinamômetro e o monitoramento de detonação ajudam a avaliar o torque enquanto se mantém um ponto de carga e rotação. Temperatura, combustível e pressão de admissão também afetam o resultado.',
          'No MAPA, registre a puxada de referência e mantenha o mapa de combustível fixo. Na linha de 100%, altere o avanço em um grau numa região que a puxada alcança. Repita o teste e compare torque, potência e estado do motor na mesma faixa de RPM.',
          'Aproximar o avanço do MBT do modelo tende a aumentar o torque. Passar desse ponto tende a reduzi-lo. Se o teste indicar detonação, volte ao último ajuste íntegro e compare as curvas. Os limites editáveis são 0–45° para aspirados e 0–35° para turbo ou supercharger.'
        ],
        exercise: 'Escolha um RPM onde a primeira puxada termina com o motor íntegro. Compare a região antes e depois de alterar uma célula próxima em 1°. Observe o que mudou também entre as colunas adjacentes.',
        sources: [{ label: 'Haltech · Calibração das tabelas base', url: 'https://support.haltech.com/portal/en/kb/articles/tuning-base-tables' }]
      },
      {
        number: '09', title: 'Como ler uma puxada no dinamômetro',
        summary: 'Distinga torque, potência, AFR, pico e estado final.',
        paragraphs: [
          'Um dinamômetro de motor mede no eixo do motor. Um dinamômetro de chassi mede na transmissão da força aos rolos ou cubos. Em um sistema com freio, uma célula de carga mede força de reação e permite obter o torque pelo braço da alavanca. Em um sistema inercial, o torque é estimado pela aceleração e pela inércia conhecidas.',
          'O MAPA calcula os pontos em vez de medi-los. Ele usa o motor selecionado e as matrizes efetivas de combustível e ignição. A puxada avança em passos de 250 RPM e encurta o passo final para chegar ao corte exato. Se houver falha antes, a curva termina no último ponto calculado.',
          'A potência e o torque podem atingir o pico em rotações diferentes. Observe a curva e o estado final antes de comparar picos, pois uma puxada interrompida cobre uma faixa menor. O gráfico converte torque de kgf·m para N·m. O histórico guarda o resumo do ensaio, como os picos, o AFR médio e o estado final.'
        ],
        formulas: ['Torque (N·m) = força (N) × braço perpendicular (m)', 'Torque inercial = momento de inércia × aceleração angular', 'Potência (W) = torque (N·m) × 2π × RPM / 60'],
        exercise: 'Compare onde aparecem o pico de torque e o pico de potência na mesma puxada. Ative a curva de AFR e confira se a faixa registrada vai até perto do corte.',
        sources: [{ label: 'Mustang Dynamometer · Manual Power Dyne PC', url: 'https://www.mustangdyne.com/wp-content/uploads/2022/09/Power-Dyne-PC-Users-Manual-v2022-09-22-01.pdf' }]
      }
    ]
  },
  {
    id: 'matematica', level: '03 · Avançado', title: 'Matemática do MAPA',
    lessons: [
      {
        number: '10', title: 'Geração dos mapas padrão',
        summary: 'Reproduza as células geradas pelo EcuMapFactory.',
        paragraphs: [
          'O sistema escolhe a classe de cilindrada mais próxima entre 0,6 e 4,0 L. As fórmulas abaixo se aplicam quando o sistema precisa gerar um mapa padrão. Se já houver um mapa padrão gravado, a simulação usa os valores gravados ou o ajuste do usuário.',
          'Na ignição gerada, a rotação eleva o avanço base e o aumento da carga o reduz. No combustível, a carga eleva o valor base e uma parábola produz uma curva com máximo em 60% do último RPM da grade. Cada resultado é arredondado para inteiro e limitado à faixa do tipo de mapa.'
        ],
        formulas: [
          'r = RPM / último RPM da grade · c = classe de cilindrada (L)',
          'Bônus de ignição = limitar(arredondar(2 × (1,8 − c)), 0, 4)',
          'Avanço base = 8 + 1,5 × RPM / 1.000 + bônus − 0,10 × (carga − 25)',
          'Fator de carga = (carga − 25) / 75',
          'Ajuste de VE = limitar(4 × (1,8 − c), −6, 6)',
          'VE base = (35 + 45 × fator de carga) × max(0,4; 1 − 1,6 × (r − 0,60)²) + ajuste de VE'
        ]
      },
      {
        number: '11', title: 'Interpolação entre células',
        summary: 'Calcule o valor que o simulador usa entre dois breakpoints.',
        paragraphs: [
          'Os pontos da puxada são mais próximos do que as colunas do mapa. A interpolação linear calcula o valor intermediário pela distância relativa entre as duas colunas. O código faz isso em duas linhas de carga e combina os resultados pela posição da carga. Esse processo é a interpolação bilinear.',
          'Na puxada padrão, a carga coincide com a primeira linha. Por isso, apenas a interpolação entre RPMs afeta a curva. Para preencher a coluna de corte, o sistema interpola os valores já gravados. Se o corte ultrapassar a faixa gravada, ele usa o valor da coluna mais alta como ponto de partida.'
        ],
        formulas: [
          'fração RPM = limitar((RPM − RPM inicial) / (RPM final − RPM inicial), 0, 1)',
          'valor na linha = valor inicial + (valor final − valor inicial) × fração RPM',
          'valor final = valor na primeira linha + (valor na segunda − valor na primeira) × fração carga'
        ],
        exercise: 'Com 18° em 3.000 RPM e 22° em 4.000 RPM na mesma linha, calcule o valor em 3.250 RPM. A fração é 0,25 e o resultado é 19°.'
      },
      {
        number: '12', title: 'Ar estimado e cálculo do AFR',
        summary: 'Veja como o modelo separa ar admitido e combustível editável.',
        paragraphs: [
          'O simulador estima a VE do ar com uma parábola em função da rotação. O máximo do modelo é 76% a 4.960 RPM, que correspondem a 62% da referência fixa de 8.000 RPM. O fator de pressão de 1,35 para indução forçada aparece na massa de ar usada no torque. A relação AFR usa diretamente a VE do ar estimada e a VE lida no mapa de combustível.',
          'O código limita o AFR exibido ao intervalo de 5 a 30. Um valor de VE de combustível menor ou igual a zero retorna 30. A alteração de VE afeta o AFR e pode interromper a puxada por mistura pobre. O cálculo de torque por ponto não recebe o AFR diretamente.'
        ],
        formulas: [
          'r = RPM / 8.000',
          'VE do ar (%) = 76 × max(0,4; 1 − 1,75 × (r − 0,62)²)',
          'Massa de ar (g) = cilindrada (L) × 1,18 × (VE do ar / 100) × fator de pressão',
          'Fator de pressão = 1,00 (aspirado) ou 1,35 (turbo ou supercharger)',
          'AFR = limitar(14,7 × VE do ar / VE de combustível, 5, 30)'
        ],
        exercise: 'Com VE do ar de 76% e VE de combustível de 80%, o AFR fica em aproximadamente 14,0:1. Se o valor editado passar a 90%, o AFR cai para aproximadamente 12,4:1.'
      },
      {
        number: '13', title: 'MBT, perdas, torque e potência',
        summary: 'Acompanhe o cálculo desde o ângulo da centelha até os cv.',
        paragraphs: [
          'O modelo estima o MBT usando taxa de compressão e RPM. A diferença entre o avanço e o MBT reduz o fator de combustão de forma quadrática. O fator fica entre 0,25 e 1. A perda em alta rotação cresce a partir de 5.600 RPM e chega a 15% a 8.000 RPM.',
          'O simulador combina a massa de ar estimada, o fator de combustão e a perda para obter torque. A constante 9,2 faz parte do modelo didático. A potência resulta do torque multiplicado pela velocidade angular e convertido para cv.'
        ],
        formulas: [
          'r = RPM / 8.000',
          'MBT (°) = 14 + 1,2 × (compressão − 9) + 0,6 × (RPM − 1.000) / 1.000',
          'Fator de combustão = limitar(1 − 0,0035 × (avanço − MBT)², 0,25, 1)',
          'Fator de atrito = 1 − 0,15 × limitar((r − 0,70) / 0,30, 0, 1)',
          'Torque (kgf·m) = massa de ar (g) × 9,2 × fator de combustão × fator de atrito',
          'Torque (N·m) = torque (kgf·m) × 9,80665',
          'Potência (cv) = torque (kgf·m) × RPM / 716,2'
        ],
        exercise: 'Com motor aspirado de 1,8 L, compressão 9:1, grade até 8.000 RPM e avanço de 16° a 5.000 RPM, o MBT é 16,4°. A VE do ar fica perto de 76% e o torque chega a cerca de 14,8 kgf·m, resultando em aproximadamente 104 cv nesse ponto.'
      },
      {
        number: '14', title: 'Interrupções, picos e médias',
        summary: 'Entenda quando uma puxada termina e quais amostras entram no resultado.',
        paragraphs: [
          'O corte cadastrado define o fim da faixa pedida. Se um passo ultrapassa o limite físico do modelo, o teste sinaliza excesso de giro antes de registrar esse ponto. Em carga de 70% ou mais, o modelo verifica primeiro mistura pobre e depois detonação. Nesses dois casos, o ponto que disparou a falha já foi registrado.',
          'Mistura pobre interrompe a puxada quando o AFR passa de 16. Detonação interrompe quando o avanço passa do limite estimado pela compressão e pelo RPM. Esses critérios servem à simulação. Um motor real depende de condições que o modelo simplifica, como temperatura, octanagem e dinâmica da combustão.',
          'O pico é o maior valor de cada curva registrada. O AFR médio é a média aritmética das amostras registradas. Se não houver amostras, o código retorna zero para os resumos.'
        ],
        formulas: [
          'Limite físico (RPM) = arredondar(10.200 − 850 × cilindrada em litros)',
          'Limite de detonação (°) = 32 − 2 × (compressão − 9) + 0,5 × (RPM − 2.000) / 1.000',
          'Pico = máximo das amostras · AFR médio = soma dos AFRs / quantidade de amostras'
        ]
      },
      {
        number: '15', title: 'Como desafios e desempenho são calculados',
        summary: 'Entenda o que o professor vê depois de uma tentativa.',
        paragraphs: [
          'A tentativa conta para o desafio selecionado se o aluno estiver matriculado na turma e o motor da puxada corresponder ao desafio. Uma mesma tentativa precisa atingir a potência mínima e terminar com o estado de motor exigido. Por exemplo, motor íntegro com 98 cv cumpre um dos dois critérios de um desafio de 255 cv que exige integridade.',
          'O desafio registra a primeira conclusão bem-sucedida. Uma nova tentativa abaixo da meta pode mudar os critérios da última passada, enquanto o registro de conclusão permanece.',
          'No dashboard do professor, cada par aluno matriculado e desafio da turma é uma oportunidade de conclusão. A taxa geral usa a soma dessas oportunidades de todas as turmas. Uma matrícula conta como ativa quando tem tentativa ou conclusão em algum desafio da turma.'
        ],
        formulas: [
          'Oportunidades na turma = matrículas × desafios',
          'Taxa de conclusão = 100 × conclusões / oportunidades, ou 0% sem oportunidades',
          'Exemplo teórico: 18 conclusões em 8 matrículas × 3 desafios = 18 / 24 = 75%'
        ]
      }
    ]
  }
];

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [AccordionModule, HeaderNavbarComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header-navbar />
    <main class="mapa-page-container help-page">
      <header class="help-intro">
        <p class="module-label">GUIA DA BANCADA</p>
        <h1 class="mapa-page-title">Ajuda</h1>
        <p>Aprenda como o motor funciona, pratique a calibração e acompanhe as contas do dinamômetro virtual.</p>
      </header>

      <nav class="module-nav" aria-label="Módulos da ajuda">
        @for (module of modules; track module.id) {
          <a routerLink="/help" [fragment]="module.id">
            <span class="module-label">{{ module.level }}</span>
            <span>{{ module.title }}</span>
          </a>
        }
      </nav>

      @for (module of modules; track module.id) {
        <section class="help-module" [id]="module.id" [attr.aria-labelledby]="module.id + '-title'">
          <p class="module-label">{{ module.level }}</p>
          <h2 [id]="module.id + '-title'">{{ module.title }}</h2>
          <p-accordion>
            @for (lesson of module.lessons; track lesson.number) {
              <p-accordion-panel [value]="lesson.number">
                <p-accordion-header>
                  <span class="lesson-number">{{ lesson.number }}</span>
                  <span class="lesson-heading">
                    <span>{{ lesson.title }}</span>
                    <span class="lesson-summary">{{ lesson.summary }}</span>
                  </span>
                </p-accordion-header>
                <p-accordion-content>
                  <div class="lesson-content">
                    @for (paragraph of lesson.paragraphs; track paragraph) {
                      <p>{{ paragraph }}</p>
                    }
                    @if (lesson.formulas; as formulas) {
                      <div class="formula-panel">
                        <h3>Fórmulas</h3>
                        <ul>
                          @for (formula of formulas; track formula) {
                            <li>{{ formula }}</li>
                          }
                        </ul>
                      </div>
                    }
                    @if (lesson.exercise; as exercise) {
                      <p class="exercise"><strong>Na prática</strong> {{ exercise }}</p>
                    }
                    @if (lesson.sources; as sources) {
                      <ul class="lesson-sources" aria-label="Referências da aula">
                        @for (source of sources; track source.url) {
                          <li><a [href]="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }}</a></li>
                        }
                      </ul>
                    }
                  </div>
                </p-accordion-content>
              </p-accordion-panel>
            }
          </p-accordion>
        </section>
      }
      <footer class="help-actions">
        <a routerLink="/calibration">Abrir calibração</a>
        <a routerLink="/dyno">Abrir dinamômetro</a>
      </footer>
    </main>
  `,
  styles: [`
    .help-page { max-width: 1060px; }
    .help-intro {
      padding: 20px 24px;
      border-left: 4px solid var(--mapa-blue-500);
      border-radius: 0 12px 12px 0;
      background: var(--mapa-blue-50);
    }
    .help-intro .mapa-page-title { margin: 4px 0 8px; }
    .help-intro p:last-child { margin: 0; color: var(--mapa-gray-700); }
    .module-label {
      margin: 0;
      color: var(--mapa-blue-900);
      font: 700 0.75rem/1.35 ui-monospace, monospace;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .module-nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
      gap: 10px;
      margin: 18px 0 30px;
    }
    .module-nav a, .help-actions a {
      padding: 10px 14px;
      border: 1px solid var(--mapa-gray-200);
      border-radius: 8px;
      background: var(--mapa-white);
      color: var(--mapa-ink);
      font-weight: 650;
      text-decoration: none;
    }
    .module-nav a { display: grid; gap: 4px; }
    .module-nav a:hover, .help-actions a:hover { border-color: var(--mapa-blue-500); }
    .help-module { margin-bottom: 28px; scroll-margin-top: 20px; }
    .help-module h2 { margin: 4px 0 12px; font-size: 1.25rem; }
    p-accordion {
      display: block;
      border: 1px solid var(--mapa-gray-200);
      border-radius: 12px;
      background: var(--mapa-white);
      --p-accordion-header-padding: 14px 16px;
    }
    .lesson-number {
      align-self: flex-start;
      margin-right: 12px;
      padding: 4px 7px;
      border-radius: 5px;
      background: var(--mapa-blue-50);
      color: var(--mapa-blue-900);
      font: 700 0.8rem/1.2 ui-monospace, monospace;
    }
    .lesson-heading { display: grid; flex: 1; gap: 4px; padding-right: 10px; }
    .lesson-summary { color: var(--mapa-gray-600); font-size: 0.84rem; font-weight: 400; }
    .lesson-content { color: var(--mapa-gray-700); font-size: 0.94rem; line-height: 1.6; }
    .lesson-content p { margin: 0 0 12px; }
    .formula-panel, .exercise { padding: 12px 14px; border-radius: 8px; background: var(--mapa-gray-50); }
    .formula-panel { margin-bottom: 12px; border: 1px solid var(--mapa-gray-200); }
    .formula-panel h3 { margin: 0 0 6px; font-size: 0.88rem; }
    .formula-panel ul { margin: 0; padding-left: 18px; font-family: ui-monospace, monospace; overflow-wrap: anywhere; }
    .formula-panel li + li { margin-top: 5px; }
    .exercise { border-left: 3px solid var(--mapa-blue-500); }
    .exercise strong { display: block; color: var(--mapa-blue-900); }
    .lesson-sources { margin: 0; padding-left: 18px; font-size: 0.84rem; }
    .lesson-sources a { color: var(--mapa-blue-900); }
    .help-actions { display: flex; flex-wrap: wrap; gap: 10px; }
  `]
})
export class HelpPageComponent {
  readonly modules = HELP_MODULES;
}
