import { DialogModule } from 'primeng/dialog';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export const TERMS_OF_USE_VERSION = '2.0';

export interface TermsSection {
  readonly title: string;
  readonly text: string;
}

const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    title: '1. Uso educacional',
    text: 'O MAPA (Motor Analysis & Performance Academy) oferece aulas, catálogo de motores, mapas de calibração de ECU, dinamômetro virtual e desafios. Os resultados são estimativas para estudo. Proteja suas credenciais e use as funções da plataforma respeitando os demais participantes e as regras da sua turma.'
  },
  {
    title: '2. Conta, autenticação e recuperação',
    text: 'Tratamos nome, e-mail, perfil (aluno, professor ou administrador), situação da conta, datas cadastrais e data e versão do aceite para criar e gerenciar o acesso. A senha é armazenada como resumo criptográfico bcrypt. A recuperação por e-mail usa um token temporário. O navegador guarda o token de sessão, os dados da conta e o vencimento em armazenamento de sessão (sessionStorage).'
  },
  {
    title: '3. Atividades de aprendizagem',
    text: 'Associamos à conta o motor selecionado, os ajustes de ignição e combustível e os resultados das passadas, incluindo data, picos de potência e torque, AFR médio e estado do motor. Também registramos vínculos com turmas, desafios selecionados, quantidade de tentativas, último resultado e conclusão. Usamos esses dados para salvar o trabalho, acompanhar a aprendizagem e apresentar indicadores de desempenho.'
  },
  {
    title: '4. Quem pode ver os dados',
    text: 'O professor pode consultar nome, e-mail e progresso dos alunos nas turmas sob sua responsabilidade e acompanhar indicadores agregados de desempenho. Administradores têm acesso às funções de gestão de contas e aos registros de auditoria. Os registros podem incluir identificadores de conta, e-mails, datas e ações como aceite, mudanças cadastrais, anonimização e restauração de bases.'
  },
  {
    title: '5. Finalidades e fundamento do tratamento',
    text: 'O MAPA utiliza dados para prestar as funcionalidades solicitadas, acompanhar atividades das turmas, manter a segurança e a rastreabilidade e atender obrigações aplicáveis. A base legal depende da finalidade e do contexto de uso, conforme a LGPD. Quando o tratamento se basear em consentimento, ele pode ser revogado. O aceite no cadastro registra a adesão a estes termos e a ciência sobre esta política.'
  },
  {
    title: '6. Provedores e compartilhamento',
    text: 'Na implantação do projeto, Vercel e Render hospedam a interface e a API, Supabase fornece o banco de dados e Resend envia e-mails transacionais, como o de recuperação de senha. Esses serviços recebem os dados necessários às suas funções. O tratamento por provedores pode ocorrer fora do Brasil, conforme a infraestrutura contratada e os mecanismos aplicáveis da LGPD. Dados também podem ser comunicados quando houver obrigação legal ou ordem de autoridade competente.'
  },
  {
    title: '7. Conservação e pedidos sobre a conta',
    text: 'A desativação impede o acesso e mantém os registros. A função de anonimização da conta substitui nome e e-mail no cadastro, desativa o acesso e revoga sessões. Ela não exclui automaticamente o histórico pedagógico associado ao identificador da conta. O log da operação pode manter o e-mail anterior para rastreabilidade. Pedidos de eliminação, bloqueio ou anonimização devem ser avaliados conforme a finalidade, a necessidade de conservação e as hipóteses legais aplicáveis.'
  },
  {
    title: '8. Direitos de privacidade',
    text: 'Você pode solicitar confirmação do tratamento, acesso, correção, informações sobre compartilhamento e, quando aplicável, portabilidade, bloqueio, anonimização ou eliminação. Quando houver consentimento, pode revogá-lo e pedir a eliminação dos dados tratados com essa base, observadas as hipóteses legais de conservação. Também pode peticionar à ANPD nos termos da LGPD. A plataforma oferece edição de e-mail e senha em Configurações para alunos e professores.'
  },
  {
    title: '9. Segurança e versões do termo',
    text: 'A plataforma usa autenticação por token, controle de acesso por perfil e registros de auditoria. No cadastro, o MAPA registra a data e a versão do termo aceito. A publicação de uma versão atualizada não altera o registro histórico de versões já aceitas.'
  },
  {
    title: '10. Controlador e contato de privacidade',
    text: 'O controlador dos dados pessoais é o MAPA-suporte. Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, escreva para mapa-rsb@gmail.com. Informe o e-mail da conta e o direito que deseja exercer. Nunca envie a senha ou tokens de acesso.'
  }
];

@Component({
  selector: 'app-terms-of-use-modal',
  standalone: true,
  imports: [DialogModule, CommonModule],
  template: `
    <p-dialog header="Termos de Uso e Privacidade do MAPA" [visible]="true" [modal]="true"
      [draggable]="false" [style]="{ width: 'min(92vw, 640px)' }" styleClass="mapa-dialog"
      [dismissableMask]="true" (visibleChange)="handleVisibilityChange($event)">
      <p class="terms-version">Versão {{ termsVersion }} · 14/11/2026</p>

        <div class="terms-body">
          @for (section of sections; track section.title) {
            <section class="terms-section">
              <h3 class="terms-section-title">{{ section.title }}</h3>
              <p class="terms-section-text">{{ section.text }}</p>
            </section>
          }
        </div>

        <footer class="terms-footer">
          <button type="button" class="terms-acknowledge-button" (click)="handleClose()">
            <i class="pi pi-check"></i>
            <span>Entendi</span>
          </button>
        </footer>
    </p-dialog>
  `,
  styles: [`
    .terms-version {
      font-size: 0.8rem;
      color: var(--mapa-gray-500);
      margin: 6px 0 0 0;
    }

    .terms-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .terms-section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--mapa-ink);
      margin: 0 0 4px 0;
    }

    .terms-section-text {
      font-size: 0.85rem;
      line-height: 1.55;
      color: var(--mapa-gray-600);
      margin: 0;
    }

    .terms-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px 22px 24px;
      border-top: 1px solid var(--mapa-gray-200);
      position: sticky;
      bottom: 0;
      background-color: var(--mapa-white);
    }

    .terms-acknowledge-button {
      height: 42px;
      padding: 0 18px;
      border: none;
      border-radius: 10px;
      background-color: var(--mapa-blue-500);
      color: var(--mapa-white);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s ease;
    }

    .terms-acknowledge-button:hover {
      background-color: var(--mapa-blue-600);
    }
  `]
})
export class TermsOfUseModalComponent {
  handleVisibilityChange(visible: boolean): void {
    if (!visible) this.handleClose();
  }

  @Output() close = new EventEmitter<void>();

  readonly termsVersion = TERMS_OF_USE_VERSION;
  readonly sections: readonly TermsSection[] = TERMS_SECTIONS;

  handleClose(): void {
    this.close.emit();
  }

}
