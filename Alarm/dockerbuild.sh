# x86/amd64
docker build -t alarm .
docker tag alarm welasco/hubitatalarm:amd64_1
docker tag alarm welasco/hubitatalarm:amd64_1.0
docker tag alarm welasco/hubitatalarm:amd64_1.0.1
docker login
docker push welasco/hubitatalarm:amd64_1
docker push welasco/hubitatalarm:amd64_1.0
docker push welasco/hubitatalarm:amd64_1.0.1

# linux/arm/v7
docker build -t alarm .
docker tag alarm welasco/hubitatalarm:armv7_1
docker tag alarm welasco/hubitatalarm:armv7_1.0
docker tag alarm welasco/hubitatalarm:armv7_1.0.1
docker login
docker push welasco/hubitatalarm:armv7_1
docker push welasco/hubitatalarm:armv7_1.0
docker push welasco/hubitatalarm:armv7_1.0.1

# linux/arm/v6
docker build -t alarm .
docker tag alarm welasco/hubitatalarm:armv6_1
docker tag alarm welasco/hubitatalarm:armv6_1.0
docker tag alarm welasco/hubitatalarm:armv6_1.0.1
docker login
docker push welasco/hubitatalarm:armv6_1
docker push welasco/hubitatalarm:armv6_1.0
docker push welasco/hubitatalarm:armv6_1.0.1

# Manifest
docker manifest create welasco/hubitatalarm:latest \
    --amend welasco/hubitatalarm:amd64_1.0.1 \
    --amend welasco/hubitatalarm:armv7_1.0.1 \
    --amend welasco/hubitatalarm:armv6_1.0.1

docker manifest create welasco/hubitatalarm:1 \
    --amend welasco/hubitatalarm:amd64_1 \
    --amend welasco/hubitatalarm:armv7_1 \
    --amend welasco/hubitatalarm:armv6_1

docker manifest create welasco/hubitatalarm:1.0 \
    --amend welasco/hubitatalarm:amd64_1.0 \
    --amend welasco/hubitatalarm:armv7_1.0 \
    --amend welasco/hubitatalarm:armv6_1.0

docker manifest create welasco/hubitatalarm:1.0.1 \
    --amend welasco/hubitatalarm:amd64_1.0.1 \
    --amend welasco/hubitatalarm:armv7_1.0.1 \
    --amend welasco/hubitatalarm:armv6_1.0.1

docker manifest push welasco/hubitatalarm:latest
docker manifest push welasco/hubitatalarm:1
docker manifest push welasco/hubitatalarm:1.0
docker manifest push welasco/hubitatalarm:1.0.1

##########################################
# Additional commands that might be useful
##########################################
# remove a manifest for the latest tag
docker manifest rm welasco/hubitatalarm

# check how a manifest would be pushed to the registry
docker manifest inspect welasco/hubitatalarm

