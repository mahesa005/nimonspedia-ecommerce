FROM php:8.3-fpm-alpine

RUN apk add --no-cache --update postgresql-dev

RUN docker-php-ext-install pdo pdo_pgsql

RUN echo "clear_env = no" >> /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html