-- SQL Schema for TechManager (fixed & ready)
CREATE DATABASE IF NOT EXISTS techmanager;
USE techmanager;

CREATE TABLE IF NOT EXISTS funcionarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_contratacao DATE NOT NULL,
    salario DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS projetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_prevista_termino DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Planejamento'
);

CREATE TABLE IF NOT EXISTS alocacoes (
    funcionario_id INT,
    projeto_id INT,
    data_alocacao DATE NOT NULL,
    horas_trabalhadas INT NOT NULL,
    PRIMARY KEY (funcionario_id, projeto_id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

DELIMITER $$
CREATE TRIGGER trg_atualizar_status_projeto_auto
AFTER INSERT ON alocacoes
FOR EACH ROW
BEGIN
    IF (SELECT COUNT(*) FROM alocacoes WHERE projeto_id = NEW.projeto_id) = 1 THEN
        UPDATE projetos
        SET status = 'Em Andamento'
        WHERE id = NEW.projeto_id AND status = 'Planejamento';
    END IF;
END$$
DELIMITER ;

-- Sample data (same as provided, cleaned)
INSERT INTO funcionarios (nome, cargo, email, data_contratacao, salario) VALUES
('Ana Clara Silva', 'Desenvolvedora Sênior', 'ana.silva@techmanager.com', '2020-03-15', 7500.00),
('Bruno Mendes Costa', 'Analista de Dados Júnior', 'bruno.costa@techmanager.com', '2023-08-22', 4200.50),
('Carla Oliveira Souza', 'Gerente de Projetos', 'carla.souza@techmanager.com', '2019-11-01', 9800.75),
('Daniel Pereira Lima', 'Especialista em Cloud', 'daniel.lima@techmanager.com', '2021-05-10', 8900.00),
('Eduarda Alves Rocha', 'Designer UX/UI', 'eduarda.rocha@techmanager.com', '2022-01-25', 6100.20);

INSERT INTO projetos (nome, descricao, data_inicio, data_prevista_termino, status) VALUES
('Plataforma Interna de RH', 'Desenvolvimento de um novo sistema de gestão de recursos humanos.', '2024-01-10', '2024-12-31', 'Planejamento'),
('Otimização do E-commerce', 'Melhoria de performance e usabilidade da plataforma de vendas online.', '2023-06-05', '2024-05-01', 'Planejamento'),
('Migração para Cloud AWS', 'Processo de migração de toda a infraestrutura para a nuvem AWS.', '2024-03-20', '2025-01-30', 'Planejamento'),
('Aplicativo Mobile de Vendas', 'Criação de um aplicativo móvel para equipe de vendas.', '2023-10-15', '2024-09-15', 'Planejamento'),
('Análise de Dados de Mercado', 'Projeto de BI para analisar tendências de mercado.', '2024-02-01', '2024-08-01', 'Planejamento');

INSERT INTO alocacoes (funcionario_id, projeto_id, data_alocacao, horas_trabalhadas) VALUES
(1, 1, '2024-01-15', 160),
(3, 1, '2024-01-10', 80),
(2, 5, '2024-02-05', 120),
(4, 3, '2024-04-01', 40),
(5, 4, '2023-11-01', 200);
