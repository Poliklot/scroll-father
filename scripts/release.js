import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

(async () => {
	const spinner = ora();

	try {
		// Пути к файлам package.json
		const rootPackagePath = './package.json';
		const packagePackagePath = './package/package.json';

		// Читаем package.json из корня и package/
		const rootPkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
		const pkg = JSON.parse(fs.readFileSync(packagePackagePath, 'utf-8'));

		// Получаем новую версию из аргументов или запрашиваем у пользователя
		let newVersion = process.argv[2];
		if (!newVersion) {
			const { version } = await inquirer.prompt([
				{
					type: 'input',
					name: 'version',
					message: `Введите новую версию (текущая версия ${pkg.version}):`,
					default: pkg.version,
				},
			]);
			newVersion = version;
		}

		// Обновляем версию в package/package.json и в корневом package.json
		if (newVersion) {
			pkg.version = newVersion;
			rootPkg.version = newVersion; // Обновляем версию также в корневом package.json

			fs.writeFileSync(packagePackagePath, JSON.stringify(pkg, null, '\t'));
			fs.writeFileSync(rootPackagePath, JSON.stringify(rootPkg, null, '\t'));
			console.log(chalk.green(`\nВерсия обновлена до ${newVersion}\n`));
		}

		// Сборка проекта
		console.log(chalk.blue('Сборка проекта...'));
		execSync('npm run build', { stdio: 'inherit' });

		// Пути к директориям
		const distPath = path.resolve('./dist');
		const packagePath = path.resolve('./package');

		// Копирование файлов из dist/ в package/
		console.log(chalk.blue('\nКопирование файлов из dist/ в package/...'));
		const copiedItems = [];

		function copyRecursiveSync(src, dest) {
			const stats = fs.statSync(src);
			if (stats.isDirectory()) {
				if (!fs.existsSync(dest)) {
					fs.mkdirSync(dest);
				}
				const items = fs.readdirSync(src);
				items.forEach(item => {
					copyRecursiveSync(path.join(src, item), path.join(dest, item));
				});
			} else {
				fs.copyFileSync(src, dest);
			}
			copiedItems.push(dest);
		}

		const distItems = fs.readdirSync(distPath);
		distItems.forEach(item => {
			const srcPath = path.join(distPath, item);
			const destPath = path.join(packagePath, item);
			copyRecursiveSync(srcPath, destPath);
		});

		// Вывод списка скопированных файлов
		console.log(chalk.green('\nСкопированные файлы и директории:'));
		copiedItems.forEach(item => {
			console.log(chalk.yellow(` - ${item}`));
		});
		// Сохраняем список скопированных элементов в файл
		fs.writeFileSync('./copiedItems.json', JSON.stringify(copiedItems, null, '\t'));

		// Запрос на создание git тега
		const { createTag } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'createTag',
				message: `Создать git-тег v${newVersion}?`,
				default: true,
			},
		]);

		if (createTag) {
			try {
				// Создание git тега
				console.log(chalk.blue(`\nСоздание git-тега v${newVersion}...`));
				spinner.start('Создание тега...');
				execSync(`git tag -a v${newVersion} -m "Release version ${newVersion}"`, { stdio: 'pipe' });
				spinner.succeed(`Git-тег v${newVersion} успешно создан`);

				// Запрос на отправку тега в удаленный репозиторий
				const { pushTag } = await inquirer.prompt([
					{
						type: 'confirm',
						name: 'pushTag',
						message: 'Отправить тег в удаленный репозиторий?',
						default: false,
					},
				]);

				if (pushTag) {
					spinner.start('Отправка тега...');
					execSync('git push --tags', { stdio: 'pipe' });
					spinner.succeed('Тег отправлен в удаленный репозиторий');
				}
			} catch (error) {
				spinner.fail(`Ошибка при работе с git: ${error.message}`);
				console.error(chalk.red('Подробная ошибка:'), error);
			}
		}

		// Запрос подтверждения на публикацию
		const { publish } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'publish',
				message: 'Опубликовать пакет на npm?',
				default: false,
			},
		]);

		if (publish) {
			// Публикация пакета на npm
			console.log(chalk.blue('\nПубликация на npm...'));
			spinner.start('Публикация...');
			execSync('npm publish', { stdio: 'inherit', cwd: './package' });
			spinner.succeed('Пакет опубликован на npm!');
		} else {
			// Создание пакета с помощью npm pack
			console.log(chalk.blue('\nСоздание пакета (npm pack)...'));
			spinner.start('Упаковка...');
			execSync('npm pack', { stdio: 'inherit', cwd: './package' });
			spinner.succeed('Пакет создан в виде архива.');
		}

		console.log(chalk.green('\nВыпуск успешно завершен!\n'));
	} catch (error) {
		console.error(chalk.red('Произошла ошибка:'), error);
	} finally {
		spinner.start('Удаление временных файлов...');
		try {
			const itemsToRemove = JSON.parse(fs.readFileSync('./copiedItems.json', 'utf-8'));

			itemsToRemove.forEach(item => {
				if (fs.existsSync(item)) {
					const stats = fs.statSync(item);
					if (stats.isDirectory()) {
						fs.rmSync(item, { recursive: true, force: true });
					} else {
						fs.unlinkSync(item);
					}
				}
			});
			// Удаляем файл с списком скопированных элементов
			fs.unlinkSync('./copiedItems.json');
			spinner.succeed('Удалены временные файлы!');
		} catch (error) {
			spinner.fail(`Ошибка при удалении временных файлов: ${error.message}`);
		}
		process.exit(0); // Используем 0 вместо 1, так как 1 обычно означает ошибку
	}
})();
