# Generated by Django 3.1.5 on 2021-03-13 14:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0009_comment_post'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='following',
            new_name='follow',
        ),
    ]
