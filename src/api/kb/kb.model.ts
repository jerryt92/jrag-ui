export interface KnowledgeGetListDto {
	data?: KnowledgeDto[];
}

export interface KnowledgeDto {
	/**
	 * 知识ID（文本块的SHA-1）
	 */
	textChunkId?: string;

	/**
	 * 知识概要（用于嵌入后检索的文本）
	 */
	outline?: string[];

	/**
	 * 文本块
	 */
	textChunk?: string;

	/**
	 * 嵌入模型名称
	 */
	embeddingModel?: string;

	/**
	 * 嵌入模型提供商名称
	 */
	embeddingProvider?: string;

	/**
	 * 描述
	 */
	description?: string;

	/**
	 * 文件名
	 */
	fileName?: string;

	/**
	 * 文件ID
	 */
	fileId?: number;
}