BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Sync] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dtoVersion] NVARCHAR(1000) NOT NULL,
    [lastSync] DATETIME2 NOT NULL CONSTRAINT [Sync_lastSync_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(1000) NOT NULL,
    [rawDto] NVARCHAR(max) NOT NULL,
    CONSTRAINT [Sync_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Sync_dtoVersion_key] UNIQUE NONCLUSTERED ([dtoVersion])
);

-- CreateTable
CREATE TABLE [dbo].[Campaign] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [department] NVARCHAR(1000),
    [startAt] DATETIME2 NOT NULL,
    [endAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Campaign_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Media] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [localPath] NVARCHAR(1000) NOT NULL,
    [durationSeconds] INT NOT NULL CONSTRAINT [Media_durationSeconds_df] DEFAULT 0,
    [position] INT NOT NULL,
    [slotType] NVARCHAR(1000) NOT NULL,
    [downloaded] BIT NOT NULL CONSTRAINT [Media_downloaded_df] DEFAULT 0,
    [campaignId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Media_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Media_slotType_downloaded_idx] ON [dbo].[Media]([slotType], [downloaded]);

-- AddForeignKey
ALTER TABLE [dbo].[Media] ADD CONSTRAINT [Media_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[Campaign]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
