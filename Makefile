.PHONY: clean frontend build publish dev

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf *.egg-info
	rm -rf opustag/static/*
	rm -rf frontend/dist/

frontend:
	cd frontend && npm install && npm run build
	mkdir -p opustag/static
	cp -r frontend/dist/* opustag/static/

build: clean frontend
	python3 -m build

push:
	twine upload dist/*

dev:
	docker compose -f docker-compose.dev.yml up --build --force-recreate
