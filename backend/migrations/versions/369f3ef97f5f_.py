"""empty message

Revision ID: 369f3ef97f5f
Revises: 5bd8ca659f2a
Create Date: 2023-07-28 14:33:24.099173

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '369f3ef97f5f'
down_revision = '5bd8ca659f2a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('realtor_task', schema=None) as batch_op:
        batch_op.add_column(sa.Column('QuestionId', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'questions', ['QuestionId'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('realtor_task', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('QuestionId')

    # ### end Alembic commands ###
